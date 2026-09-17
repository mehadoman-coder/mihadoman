import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Contractor, Consultant } from '../types';
import { db, doc, setDoc, getDoc, auth, googleProvider, signInWithPopup, firebaseSignOut, onAuthStateChanged } from '../lib/firebase';
import { getCoordinatesForLocationText } from '../lib/geoUtils';

export interface RegistrationData {
  role: 'client' | 'contractor' | 'consultant';
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  city: string;
  // Contractor specific
  companyName?: string;
  classificationGrade?: string;
  crNumber?: string;
  specialtyCategory?: string;
  startingPricePerMeter?: number;
  // Consultant specific
  officeName?: string;
  licenseNumber?: string;
  consultantSpecialty?: string;
  consultationFeePerHour?: number;
  bio?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  authenticateWithCredentials: (identifier: string, password: string) => { success: boolean; message?: string; role?: string };
  signInWithGoogle: () => Promise<{ success: boolean; message?: string; role?: string }>;
  registerDetailedUser: (data: RegistrationData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dedicated Secure Credentials for the Platform Owner (Private to Owner Only)
export const OWNER_CREDENTIALS = {
  usernames: ['admin', 'owner', 'admin@mihad.sa', 'almoayd7@gmail.com'],
  passwords: ['Mihad@2026', 'admin12345', 'Mihad@Admin', 'mihad2026']
};

const MIHAD_ADMIN_USER: UserProfile = {
  uid: 'admin-mihad-master',
  name: 'صاحب المنصة - الإدارة العامة',
  email: 'admin@mihad.sa',
  role: 'admin',
  phone: '+966 50 000 9999',
  companyName: 'إدارة منصة مِهاد الرقمية',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mihad_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Visitors are guests by default for privacy & security
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mihad_user_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('mihad_user_session');
    }
  }, [user]);

  /**
   * Unified smart authentication:
   * Owner credentials automatically elevate the session to 'admin' (invisible to other users).
   * Regular users authenticate according to their registered profile or input.
   */
  const authenticateWithCredentials = (identifier: string, password: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanId) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.' };
    }
    if (!cleanPass) {
      return { success: false, message: 'يرجى إدخال كلمة المرور.' };
    }

    // 1. Check Owner / Admin credentials
    const isOwnerUser = OWNER_CREDENTIALS.usernames.includes(cleanId);
    const isOwnerPass = OWNER_CREDENTIALS.passwords.includes(cleanPass);

    if (isOwnerUser && isOwnerPass) {
      setUser(MIHAD_ADMIN_USER);
      return { 
        success: true, 
        role: 'admin', 
        message: 'مرحباً بك يا صاحب المنصة، تم تفعيل صلاحيات الإدارة بنجاح.' 
      };
    }

    if (isOwnerUser && !isOwnerPass) {
      return { success: false, message: 'كلمة المرور الخاصة بحساب الإدارة غير صحيحة.' };
    }

    // 2. Check locally saved registered users
    const registeredListStr = localStorage.getItem('mihad_registered_users');
    if (registeredListStr) {
      try {
        const registeredList: UserProfile[] = JSON.parse(registeredListStr);
        const match = registeredList.find(u => 
          u.email.toLowerCase() === cleanId || 
          u.name.toLowerCase() === cleanId
        );
        if (match) {
          setUser(match);
          return { success: true, role: match.role, message: `مرحباً بك، ${match.name}. تم تسجيل الدخول.` };
        }
      } catch (e) {
        // Fallback
      }
    }

    // 3. Regular User Login Fallback
    let inferredRole: 'client' | 'contractor' | 'consultant' = 'client';
    if (cleanId.includes('contractor') || cleanId.includes('مقا') || cleanId.includes('muqawil')) {
      inferredRole = 'contractor';
    } else if (cleanId.includes('consultant') || cleanId.includes('استشار') || cleanId.includes('eng')) {
      inferredRole = 'consultant';
    }

    const regularUser: UserProfile = {
      uid: `usr-${Date.now()}`,
      name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@mihad.sa`,
      role: inferredRole,
      phone: '+966 50 123 4567'
    };

    setUser(regularUser);
    return { success: true, role: inferredRole, message: 'تم تسجيل الدخول بنجاح.' };
  };

  /**
   * Detailed Registration for the 3 Public Account Types:
   * 1. Client / Project Owner
   * 2. Certified Contractor
   * 3. Engineering Consultant
   */
  const registerDetailedUser = async (data: RegistrationData) => {
    try {
      const uid = `usr-${Date.now()}`;
      const newUserProfile: UserProfile = {
        uid,
        name: data.role === 'contractor' 
          ? (data.companyName || data.fullName) 
          : data.role === 'consultant' 
            ? (data.officeName || data.fullName) 
            : data.fullName,
        email: data.email.trim().toLowerCase(),
        role: data.role,
        phone: data.phone,
        companyName: data.companyName || data.officeName || undefined
      };

      // Save to Firebase Users
      try {
        await setDoc(doc(db, 'users', uid), {
          ...data,
          uid,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Firebase user save notice:', e);
      }

      // If Contractor, also save to Firestore Contractors so they appear on the marketplace
      if (data.role === 'contractor') {
        const newContractor: Contractor = {
          id: uid,
          name: data.fullName,
          companyName: data.companyName || data.fullName,
          category: (data.specialtyCategory as any) || 'general',
          rating: 5.0,
          reviewsCount: 1,
          verified: true,
          location: data.city || 'مسقط',
          coordinates: getCoordinatesForLocationText(data.city || 'مسقط'),
          experienceYears: 5,
          completedProjectsCount: 12,
          bio: `مؤسسة مقاولات معتمدة في ${data.city || 'مسقط'}. سجل تجاري رقم ${data.crNumber || 'CR-10892341'}.`,
          phone: data.phone,
          email: data.email,
          services: ['تنفيذ مشاريع معتمدة', 'أعمال عظم بالمواد وتشطيب', 'تسليم مفتاح'],
          startingPricePerMeter: Number(data.startingPricePerMeter) || 140,
          licenseNumber: data.crNumber || `CR-${Date.now()}`,
          classificationGrade: (data.classificationGrade as any) || 'درجة أولى - مجلس المناقصات',
          avatarUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=500'
        };
        try {
          await setDoc(doc(db, 'contractors', uid), newContractor);
        } catch (e) {
          console.warn('Contractor save notice:', e);
        }
      }

      // If Consultant, also save to Firestore Consultants so they appear on the marketplace
      if (data.role === 'consultant') {
        const newConsultant: Consultant = {
          id: uid,
          name: data.fullName,
          officeName: data.officeName || data.fullName,
          specialty: (data.consultantSpecialty as any) || 'architectural',
          rating: 5.0,
          reviewsCount: 1,
          verified: true,
          location: data.city || 'مسقط',
          coordinates: getCoordinatesForLocationText(data.city || 'مسقط'),
          experienceYears: 7,
          accreditedProjectsCount: 24,
          bio: data.bio || `مكتب استشارات هندسية معتمد ومرخص برقم اعتماد ${data.licenseNumber || 'ENG-XXXX'}.`,
          phone: data.phone,
          email: data.email,
          services: ['مخططات معمارية وإنشائية', 'إشراف هندسي معتمد', 'تراخيص وتصاريح بلدية'],
          consultationFeePerHour: Number(data.consultationFeePerHour) || 45,
          accreditationBody: `مكتب استشاري هندسي معتمد (#${data.licenseNumber || '99882'})`,
          avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500'
        };
        try {
          await setDoc(doc(db, 'consultants', uid), newConsultant);
        } catch (e) {
          console.warn('Consultant save notice:', e);
        }
      }

      // Cache locally
      const registeredListStr = localStorage.getItem('mihad_registered_users');
      let registeredList: UserProfile[] = [];
      if (registeredListStr) {
        try { registeredList = JSON.parse(registeredListStr); } catch (e) {}
      }
      registeredList.push(newUserProfile);
      localStorage.setItem('mihad_registered_users', JSON.stringify(registeredList));

      setUser(newUserProfile);
      return { success: true, message: 'تم إنشاء الحساب بنجاح، مرحباً بك في منصة مِهاد!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'تعذر استكمال التسجيل.' };
    }
  };

  /**
   * Google Sign-In using Firebase Auth
   */
  const signInWithGoogle = async (): Promise<{ success: boolean; message?: string; role?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const email = (fbUser.email || '').trim().toLowerCase();
      const isOwner = OWNER_CREDENTIALS.usernames.includes(email) || email === 'almoayd7@gmail.com';

      // Check if user profile already exists in Firestore
      let userDoc: any = null;
      try {
        const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
        if (docSnap.exists()) {
          userDoc = docSnap.data();
        }
      } catch (e) {
        console.warn('Could not check user in Firestore:', e);
      }

      const inferredRole = isOwner ? 'admin' : (userDoc?.role || 'client');
      const googleProfile: UserProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || userDoc?.name || (email.includes('@') ? email.split('@')[0] : 'مستخدم جوجل'),
        email: email,
        role: inferredRole,
        phone: fbUser.phoneNumber || userDoc?.phone || '+968 9000 0000',
        avatarUrl: fbUser.photoURL || userDoc?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
        companyName: userDoc?.companyName || (isOwner ? 'إدارة منصة مِهاد الرقمية' : undefined)
      };

      // Save or update user document in Firestore
      try {
        await setDoc(doc(db, 'users', fbUser.uid), {
          uid: fbUser.uid,
          name: googleProfile.name,
          email: googleProfile.email,
          role: googleProfile.role,
          avatarUrl: googleProfile.avatarUrl,
          lastLogin: new Date().toISOString(),
          provider: 'google.com'
        }, { merge: true });
      } catch (e) {
        console.warn('Could not save user to Firestore:', e);
      }

      setUser(googleProfile);
      return { 
        success: true, 
        role: googleProfile.role, 
        message: isOwner 
          ? 'مرحباً بك يا صاحب المنصة، تم تفعيل صلاحيات الإدارة عبر حساب جوجل!' 
          : 'تم تسجيل الدخول بنجاح عبر حساب Google!' 
      };
    } catch (err: any) {
      console.error('Firebase Google Sign-In Error:', err);
      let errMsg = 'تعذر تسجيل الدخول باستخدام حساب Google.';
      if (err.code === 'auth/popup-blocked') {
        errMsg = 'تم حظر النافذة المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة ثم المحاولة مجدداً.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        errMsg = 'تم إغلاق نافذة الدخول قبل إتمام المصادقة.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        errMsg = 'تم إلغاء طلب المصادقة.';
      } else if (err.message) {
        errMsg = `خطأ في المصادقة: ${err.message}`;
      }
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout error:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin: user?.role === 'admin',
      authenticateWithCredentials,
      signInWithGoogle,
      registerDetailedUser,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
