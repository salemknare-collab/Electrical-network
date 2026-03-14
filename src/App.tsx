import React, { useState, useEffect } from 'react';
import { initialIncidents, sources as initialSources } from './data';
import { Incident, Sources } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DailyReport from './pages/DailyReport';
import MonthlyReport from './pages/MonthlyReport';
import DisconnectedLines from './pages/DisconnectedLines';
import AddEvent from './pages/AddEvent';
import ManageSources from './pages/ManageSources';
import Backup from './pages/Backup';
import EditIncidentModal from './components/EditIncidentModal';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, writeBatch, getDocs } from 'firebase/firestore';

export type Page = 'dashboard' | 'daily-report' | 'monthly-report' | 'disconnected' | 'add-event' | 'manage-sources' | 'backup';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sources, setSources] = useState<Sources>(initialSources);
  const [session, setSession] = useState<{ employeeName: string; date: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync with Firebase Firestore
  useEffect(() => {
    const unsubscribeIncidents = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      const incidentsData = snapshot.docs.map(doc => doc.data() as Incident);
      // Sort by date descending
      incidentsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setIncidents(incidentsData);
    });

    const unsubscribeSources = onSnapshot(doc(db, 'settings', 'sources'), (docSnap) => {
      if (docSnap.exists()) {
        setSources(docSnap.data() as Sources);
      } else {
        // Initialize if not exists
        setDoc(doc(db, 'settings', 'sources'), initialSources);
        setSources(initialSources);
      }
    });

    setLoading(false);

    return () => {
      unsubscribeIncidents();
      unsubscribeSources();
    };
  }, []);

  const handleAddIncident = async (incident: Incident) => {
    try {
      await setDoc(doc(db, 'incidents', incident.id), incident);
    } catch (error) {
      console.error("Error adding incident: ", error);
      alert("حدث خطأ أثناء إضافة الحدث");
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'incidents', id));
    } catch (error) {
      console.error("Error deleting incident: ", error);
      alert("حدث خطأ أثناء حذف الحدث");
    }
  };

  const handleEditIncident = (incident: Incident) => {
    setEditingIncident(incident);
  };

  const handleUpdateIncident = async (updated: Incident) => {
    try {
      await setDoc(doc(db, 'incidents', updated.id), updated);
      setEditingIncident(null);
      alert('تم تحديث الحدث بنجاح!');
    } catch (error) {
      console.error("Error updating incident: ", error);
      alert("حدث خطأ أثناء تحديث الحدث");
    }
  };

  const handleUpdateSources = async (newSources: Sources) => {
    try {
      // Sanitize undefined values for Firestore
      const sanitizedSources = JSON.parse(JSON.stringify(newSources));
      await setDoc(doc(db, 'settings', 'sources'), sanitizedSources);
    } catch (error) {
      console.error("Error updating sources: ", error);
      alert("حدث خطأ أثناء تحديث المصادر");
    }
  };

  const handleRestoreBackup = async (newIncidents: Incident[], newSources: Sources) => {
    try {
      const batch = writeBatch(db);
      
      // Update sources
      const sanitizedSources = JSON.parse(JSON.stringify(newSources));
      batch.set(doc(db, 'settings', 'sources'), sanitizedSources);
      
      // Delete all existing incidents first
      const snapshot = await getDocs(collection(db, 'incidents'));
      snapshot.docs.forEach(docSnap => {
        batch.delete(docSnap.ref);
      });
      
      // Add new incidents
      newIncidents.forEach(inc => {
        batch.set(doc(db, 'incidents', inc.id), inc);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error restoring backup: ", error);
      alert("حدث خطأ أثناء استعادة النسخة الاحتياطية");
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-800">جاري تحميل البيانات...</div>;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard incidents={incidents} />;
      case 'daily-report':
        return <DailyReport incidents={incidents} sources={sources} onDelete={handleDeleteIncident} onEdit={handleEditIncident} />;
      case 'monthly-report':
        return <MonthlyReport incidents={incidents} sources={sources} onDelete={handleDeleteIncident} onEdit={handleEditIncident} />;
      case 'disconnected':
        return <DisconnectedLines incidents={incidents} sources={sources} onEdit={handleEditIncident} />;
      case 'add-event':
        return <AddEvent sources={sources} session={session} setSession={setSession} onSave={handleAddIncident} setSources={handleUpdateSources} />;
      case 'manage-sources':
        return <ManageSources sources={sources} setSources={handleUpdateSources} />;
      case 'backup':
        return <Backup incidents={incidents} sources={sources} onRestore={handleRestoreBackup} />;
      default:
        return <Dashboard incidents={incidents} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden print:h-auto print:overflow-visible print:block print:bg-white" dir="rtl">
      <Sidebar activePage={activePage} setActivePage={setActivePage} isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        <Header activePage={activePage} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 print:p-0 print:overflow-visible print:block">
          {renderPage()}
        </main>
      </div>
      {editingIncident && (
        <EditIncidentModal 
          incident={editingIncident} 
          sources={sources} 
          onClose={() => setEditingIncident(null)} 
          onSave={handleUpdateIncident} 
        />
      )}
    </div>
  );
}
