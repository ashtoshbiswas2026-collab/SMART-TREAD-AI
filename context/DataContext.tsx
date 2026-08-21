import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerDue, Customer, Transaction, Invoice, Note, AIInsight, User } from '../types';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  onSnapshot,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface DataContextType {
  // Legacy
  dues: CustomerDue[];
  setDues: React.Dispatch<React.SetStateAction<CustomerDue[]>>;
  addDue: (due: Omit<CustomerDue, 'id'>) => Promise<boolean>;
  updateDue: (due: CustomerDue) => Promise<void>;
  deleteDue: (id: string) => Promise<void>;
  
  // New Tables
  customers: Customer[];
  transactions: Transaction[];
  invoices: Invoice[];
  notes: Note[];
  aiInsights: AIInsight[];
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  addNote: (note: Omit<Note, 'id'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  loading: boolean;
  user: any;
  userProfile: User | null;
  error: string | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dues, setDues] = useState<CustomerDue[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser.uid, currentUser.email);
      } else {
        setDues([]);
        setCustomers([]);
        setTransactions([]);
        setInvoices([]);
        setNotes([]);
        setAiInsights([]);
        setUserProfile(null);
        setLoading(false);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleFirestoreError = (err: any) => {
    console.error("Firestore Error:", err);
    if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
      setError("Firestore Security Rules not configured. Please copy the rules from the instructions and paste them into your Firebase Console > Firestore Database > Rules.");
    }
  };

  const fetchUserData = async (userId: string, email: string | null) => {
    setLoading(true);
    setError(null);
    try {
      // 0. Fetch/Create User Profile
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        const localShopName = localStorage.getItem('shopName');
        
        // If local shop name exists but not in firestore, update firestore
        if (localShopName && !data.shopName) {
          await setDoc(userDocRef, { shopName: localShopName }, { merge: true });
          data.shopName = localShopName;
        } else if (data.shopName) {
          // If firestore has shop name, update local storage
          localStorage.setItem('shopName', data.shopName);
        }
        
        setUserProfile({ id: userDocSnap.id, ...data } as User);
      } else if (email) {
        // Create new user profile
        const localShopName = localStorage.getItem('shopName');
        const newUser: User = {
          id: userId,
          email: email,
          role: 'user',
          plan: 'basic',
          status: 'active',
          createdAt: new Date().toISOString(),
          ...(localShopName && { shopName: localShopName })
        };
        await setDoc(userDocRef, newUser);
        setUserProfile(newUser);
      }

      // 1. Fetch Dues
      const duesQuery = query(collection(db, 'customer_dues'), where('userId', '==', userId));
      const duesSnapshot = await getDocs(duesQuery);
      const duesData = duesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomerDue));
      setDues(duesData);

      // 2. Fetch Customers
      const custQuery = query(collection(db, 'customers'), where('userId', '==', userId));
      const custSnapshot = await getDocs(custQuery);
      setCustomers(custSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));

      // 3. Fetch Transactions
      const transQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
      const transSnapshot = await getDocs(transQuery);
      setTransactions(transSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction)));

      // 4. Fetch Invoices
      const invQuery = query(collection(db, 'invoices'), where('userId', '==', userId));
      const invSnapshot = await getDocs(invQuery);
      setInvoices(invSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice)));

      // 5. Fetch Notes
      const notesQuery = query(collection(db, 'notes'), where('userId', '==', userId));
      const notesSnapshot = await getDocs(notesQuery);
      const notesData = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
      // Sort by createdAt descending
      notesData.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setNotes(notesData);

      // 6. Fetch Insights
      const insightsQuery = query(collection(db, 'ai_insights'), where('userId', '==', userId));
      const insightsSnapshot = await getDocs(insightsQuery);
      setAiInsights(insightsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AIInsight)));

    } catch (error: any) {
      handleFirestoreError(error);
    } finally {
      setLoading(false);
    }
  };

  const addDue = async (due: Omit<CustomerDue, 'id'>): Promise<boolean> => {
    if (!user) {
      console.error("No user logged in");
      return false;
    }
    try {
      const docRef = await addDoc(collection(db, 'customer_dues'), {
        ...due,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setDues(prev => [...prev, { ...due, id: docRef.id }]);
      return true;
    } catch (e: any) {
      handleFirestoreError(e);
      return false;
    }
  };

  const updateDue = async (updatedDue: CustomerDue) => {
    if (!user) return;
    try {
      const dueRef = doc(db, 'customer_dues', updatedDue.id);
      const { id, ...data } = updatedDue;
      await updateDoc(dueRef, data);
      setDues(prev => prev.map(d => d.id === id ? updatedDue : d));
    } catch (e) {
      console.error("Error updating due:", e);
    }
  };

  const deleteDue = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'customer_dues', id));
      setDues(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error("Error deleting due:", e);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setTransactions(prev => [...prev, { ...transaction, id: docRef.id }]);
    } catch (e) {
      console.error("Error adding transaction:", e);
      handleFirestoreError(e);
    }
  };

  const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    if (!user) return;
    try {
      const transactionRef = doc(db, 'transactions', id);
      await updateDoc(transactionRef, updatedData);
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    } catch (e) {
      console.error("Error updating transaction:", e);
      handleFirestoreError(e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error("Error deleting transaction:", e);
      handleFirestoreError(e);
    }
  };

  const addNote = async (note: Omit<Note, 'id'>) => {
    if (!user) return;
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        ...note,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
      setNotes(prev => [{ ...note, id: docRef.id }, ...prev]);
    } catch (e) {
      console.error("Error adding note:", e);
      handleFirestoreError(e);
    }
  };

  const updateNote = async (id: string, updatedData: Partial<Note>) => {
    if (!user) return;
    try {
      const noteRef = doc(db, 'notes', id);
      await updateDoc(noteRef, updatedData);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
    } catch (e) {
      console.error("Error updating note:", e);
      handleFirestoreError(e);
    }
  };

  const deleteNote = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'notes', id));
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error("Error deleting note:", e);
      handleFirestoreError(e);
    }
  };

  return (
    <DataContext.Provider value={{ 
      dues, setDues, addDue, updateDue, deleteDue,
      customers, transactions, invoices, notes, aiInsights,
      addTransaction, updateTransaction, deleteTransaction,
      addNote, updateNote, deleteNote,
      loading, user, userProfile, error
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
