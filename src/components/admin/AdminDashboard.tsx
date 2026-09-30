import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePlaces } from '../../context/PlacesContext';
import { useCulture } from '../../context/CultureContext';
import { Place } from '../../types/place';
import { CultureItem } from '../../types/culture';
import { EditPlaceModal } from './EditPlaceModal';
import { EditCultureModal } from './EditCultureModal';
import {
  ShieldCheck,
  ShieldAlert,
  Compass,
  Feather,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  History,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
  onPreviewPlace: (place: Place) => void;
  onPreviewCulture: (culture: CultureItem) => void;
}

type TabType = 'overview' | 'places' | 'culture' | 'users' | 'audit';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToHome,
  onPreviewPlace,
  onPreviewCulture
}) => {
  const { user, isAdmin, registeredUsers, adminAuditLogs, logAdminAction } = useAuth();
  const { places, updatePlaceStatus, deletePlace } = usePlaces();
  const { cultureItems, updateCultureStatus, deleteCultureItem } = useCulture();

  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Filters
  const [placesStatusFilter, setPlacesStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [placesSearch, setPlacesSearch] = useState('');

  const [cultureStatusFilter, setCultureStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [cultureSearch, setCultureSearch] = useState('');

  const [usersSearch, setUsersSearch] = useState('');

  // Editing Modals State
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [editingCulture, setEditingCulture] = useState<CultureItem | null>(null);

  // Deletion Confirmation Dialog State
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null);
  const [deletingCulture, setDeletingCulture] = useState<CultureItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string>('');

  // 1. STRICT ACCESS DENIED CHECK
  if (!isAdmin || !user) {
    return (
      <div className="pt-28 pb-24 px-4 sm:px-6 max-w-xl mx-auto text-center animate-fadeIn">
        <div className="bg-[#FCFAF6] rounded-3xl p-8 sm:p-10 shadow-deep-card border border-red-200">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-forest-900 mb-2">
            Access Denied
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed mb-6 font-light">
            You do not have administrator permissions to view this dashboard. Only verified administrators can access moderation and site management.
          </p>
          <button
            type="button"
            onClick={onBackToHome}
            className="px-6 py-2.5 rounded-full bg-forest-900 text-gold hover:bg-forest-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Statistics
  const totalPlacesCount = places.length;
  const pendingPlacesCount = places.filter(p => p.status === 'pending').length;
  const totalCultureCount = cultureItems.length;
  const pendingCultureCount = cultureItems.filter(c => c.status === 'pending').length;
  const totalUsersCount = Math.max(registeredUsers.length, 1);

  // Filtered Places
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      const matchStatus = placesStatusFilter === 'all' || place.status === placesStatusFilter;
      const q = placesSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        place.placeName.toLowerCase().includes(q) ||
        place.address.toLowerCase().includes(q) ||
        (place.contributorName && place.contributorName.toLowerCase().includes(q)) ||
        (place.contributorEmail && place.contributorEmail.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [places, placesStatusFilter, placesSearch]);

  // Filtered Culture
  const filteredCulture = useMemo(() => {
    return cultureItems.filter(item => {
      const matchStatus = cultureStatusFilter === 'all' || item.status === cultureStatusFilter;
      const q = cultureSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.community.toLowerCase().includes(q) ||
        item.villageOrArea.toLowerCase().includes(q) ||
        (item.contributorName && item.contributorName.toLowerCase().includes(q)) ||
        (item.contributorEmail && item.contributorEmail.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [cultureItems, cultureStatusFilter, cultureSearch]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    const q = usersSearch.toLowerCase().trim();
    if (!q) return registeredUsers;
    return registeredUsers.filter(
      u =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [registeredUsers, usersSearch]);

  // Admin Actions: Places
  const handleApprovePlace = async (place: Place) => {
    await updatePlaceStatus(place.id, 'approved');
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'APPROVE_PLACE',
      contentType: 'place',
      contentId: place.id,
      contentTitle: place.placeName,
      notes: 'Approved for public listing'
    });
    setActionNotice(`Approved "${place.placeName}" for public discovery.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleRejectPlace = async (place: Place) => {
    await updatePlaceStatus(place.id, 'rejected');
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'REJECT_PLACE',
      contentType: 'place',
      contentId: place.id,
      contentTitle: place.placeName,
      notes: 'Marked as rejected/revisions required'
    });
    setActionNotice(`Marked "${place.placeName}" as rejected.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleConfirmDeletePlace = async () => {
    if (!deletingPlace) return;
    setIsDeleting(true);
    await deletePlace(deletingPlace.id);
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'DELETE_PLACE',
      contentType: 'place',
      contentId: deletingPlace.id,
      contentTitle: deletingPlace.placeName,
      notes: 'Permanently deleted place and references'
    });
    setIsDeleting(false);
    setActionNotice(`Place "${deletingPlace.placeName}" deleted successfully.`);
    setDeletingPlace(null);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Admin Actions: Culture
  const handleApproveCulture = async (item: CultureItem) => {
    await updateCultureStatus(item.id, 'approved');
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'APPROVE_CULTURE',
      contentType: 'culture',
      contentId: item.id,
      contentTitle: item.title,
      notes: 'Approved cultural contribution for public archive'
    });
    setActionNotice(`Approved "${item.title}" for living cultural archive.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleRejectCulture = async (item: CultureItem) => {
    await updateCultureStatus(item.id, 'rejected');
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'REJECT_CULTURE',
      contentType: 'culture',
      contentId: item.id,
      contentTitle: item.title,
      notes: 'Marked cultural story as rejected'
    });
    setActionNotice(`Marked "${item.title}" as rejected.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const handleConfirmDeleteCulture = async () => {
    if (!deletingCulture) return;
    setIsDeleting(true);
    await deleteCultureItem(deletingCulture.id);
    await logAdminAction({
      adminUid: user.uid,
      adminEmail: user.email,
      action: 'DELETE_CULTURE',
      contentType: 'culture',
      contentId: deletingCulture.id,
      contentTitle: deletingCulture.title,
      notes: 'Permanently deleted cultural entry'
    });
    setIsDeleting(false);
    setActionNotice(`Cultural entry "${deletingCulture.title}" deleted successfully.`);
    setDeletingCulture(null);
    setTimeout(() => setActionNotice(''), 4000);
  };

  const renderStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3 h-3 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn space-y-8">
      {/* Top Bar with Back Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-800 hover:text-gold-dark transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>← Back to Public Website</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900 text-gold text-xs font-bold border border-gold/40 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-gold" />
          <span>Role: Administrator</span>
        </span>
      </div>

      {/* Main Admin Header Card */}
      <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-gold/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gold text-forest-900 flex items-center justify-center font-serif font-black text-2xl border-2 border-white shadow-md overflow-hidden shrink-0">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span>{user.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-gold block">
                UNEXPLORED DHEMAJI
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                ADMIN DASHBOARD
              </h1>
              <p className="text-xs text-stone-300 mt-1">
                Signed in as <strong className="text-white">{user.email}</strong> • Full Moderation &amp; Management Privileges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Firestore Rules Enforced</span>
            </span>
          </div>
        </div>
      </div>

      {/* Status Notice Toast */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice('')}
            className="text-stone-400 hover:text-stone-700 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-stone-200 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-forest-900 text-gold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <span>📊 Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('places')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'places'
              ? 'bg-forest-900 text-gold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Manage Tourism Places ({totalPlacesCount})</span>
          {pendingPlacesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-forest-900 text-[10px] font-black">
              {pendingPlacesCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('culture')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'culture'
              ? 'bg-forest-900 text-gold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Manage Culture ({totalCultureCount})</span>
          {pendingCultureCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-forest-900 text-[10px] font-black">
              {pendingCultureCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-forest-900 text-gold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users ({totalUsersCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-forest-900 text-gold shadow-sm'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit History ({adminAuditLogs.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW STATISTICS ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-[#FCFAF6] p-5 rounded-3xl border border-stone-200/90 shadow-deep-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                  TOTAL PLACES
                </span>
                <Compass className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="font-serif text-3xl font-black text-forest-900">{totalPlacesCount}</h3>
              <p className="text-[11px] text-stone-500 mt-1">Tourism destinations</p>
            </div>

            <div className="bg-[#FCFAF6] p-5 rounded-3xl border border-amber-300 shadow-deep-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  PENDING PLACES
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-serif text-3xl font-black text-amber-900">{pendingPlacesCount}</h3>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting moderation</p>
            </div>

            <div className="bg-[#FCFAF6] p-5 rounded-3xl border border-stone-200/90 shadow-deep-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                  TOTAL CULTURE
                </span>
                <Feather className="w-4 h-4 text-gold-dark" />
              </div>
              <h3 className="font-serif text-3xl font-black text-forest-900">{totalCultureCount}</h3>
              <p className="text-[11px] text-stone-500 mt-1">Cultural traditions</p>
            </div>

            <div className="bg-[#FCFAF6] p-5 rounded-3xl border border-amber-300 shadow-deep-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  PENDING CULTURE
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-serif text-3xl font-black text-amber-900">{pendingCultureCount}</h3>
              <p className="text-[11px] text-amber-700 mt-1">Awaiting moderation</p>
            </div>

            <div className="bg-[#FCFAF6] p-5 rounded-3xl border border-stone-200/90 shadow-deep-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                  TOTAL USERS
                </span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-serif text-3xl font-black text-forest-900">{totalUsersCount}</h3>
              <p className="text-[11px] text-stone-500 mt-1">Registered explorers</p>
            </div>
          </div>

          {/* Quick Review Needed Banner */}
          {(pendingPlacesCount > 0 || pendingCultureCount > 0) && (
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-forest-900 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Submissions Requiring Moderator Review</span>
                </h4>
                <p className="text-xs text-charcoal-muted mt-1 font-light">
                  You have {pendingPlacesCount} pending place(s) and {pendingCultureCount} pending cultural story(ies) submitted by community members.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {pendingPlacesCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('places');
                      setPlacesStatusFilter('pending');
                    }}
                    className="px-4 py-2 rounded-xl bg-forest-900 text-gold font-bold text-xs cursor-pointer hover:bg-forest-800"
                  >
                    Review Places ({pendingPlacesCount})
                  </button>
                )}
                {pendingCultureCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('culture');
                      setCultureStatusFilter('pending');
                    }}
                    className="px-4 py-2 rounded-xl bg-gold text-forest-900 font-bold text-xs cursor-pointer hover:bg-gold-hover"
                  >
                    Review Culture ({pendingCultureCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MANAGE TOURISM PLACES ================= */}
      {activeTab === 'places' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-[#FCFAF6] p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase text-stone-500">Status:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setPlacesStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    placesStatusFilter === st
                      ? 'bg-forest-900 text-gold'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={placesSearch}
                onChange={e => setPlacesSearch(e.target.value)}
                placeholder="Search place, contributor..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-forest-700"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Places Table / Card Layout */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-[#FAF8F2] uppercase text-[10px] tracking-wider text-forest-900 border-b border-stone-200">
                  <tr>
                    <th className="p-4">Place / Destination</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Contributor</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPlaces.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No tourism places match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPlaces.map((place) => (
                      <tr key={place.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={place.coverImage}
                              alt={place.placeName}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                            />
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-serif font-bold text-forest-900 text-sm truncate">
                                {place.placeName}
                              </h4>
                              <p className="text-[11px] text-stone-500 truncate">{place.address}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-[11px]">
                            {place.category}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-forest-900 block truncate max-w-[140px]">
                            {place.contributorName || 'Explorer'}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">
                            {place.contributorEmail || 'Anonymous'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap text-stone-500">
                          {new Date(place.createdAt).toLocaleDateString()}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {renderStatusBadge(place.status)}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {/* Approve / Reject buttons if pending or changing */}
                            {place.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApprovePlace(place)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                                title="Approve place"
                              >
                                APPROVE
                              </button>
                            )}

                            {place.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectPlace(place)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                                title="Reject place"
                              >
                                REJECT
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onPreviewPlace(place)}
                              className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingPlace(place)}
                              className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-blue-700 cursor-pointer"
                              title="Edit place"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingPlace(place)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                              title="Delete place"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MANAGE CULTURE ================= */}
      {activeTab === 'culture' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-[#FCFAF6] p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold uppercase text-stone-500">Status:</span>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCultureStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    cultureStatusFilter === st
                      ? 'bg-forest-900 text-gold'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={cultureSearch}
                onChange={e => setCultureSearch(e.target.value)}
                placeholder="Search tradition, community..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-forest-700"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Culture Table */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-[#FAF8F2] uppercase text-[10px] tracking-wider text-forest-900 border-b border-stone-200">
                  <tr>
                    <th className="p-4">Tradition / Story</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Community &amp; Area</th>
                    <th className="p-4">Contributor</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCulture.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400">
                        No cultural stories match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCulture.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.coverImage}
                              alt={item.title}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                            />
                            <div className="min-w-0 max-w-xs">
                              <h4 className="font-serif font-bold text-forest-900 text-sm truncate">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-stone-500 line-clamp-1">{item.description}</p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className="font-semibold text-gold-dark bg-gold/10 px-2.5 py-1 rounded-md text-[11px]">
                            {item.category}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-forest-900 block truncate max-w-[150px]">
                            {item.community}
                          </span>
                          <span className="text-[10px] text-stone-500 block truncate max-w-[150px]">
                            {item.villageOrArea}
                          </span>
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-forest-900 block truncate max-w-[140px]">
                            {item.contributorName || 'Explorer'}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[140px]">
                            {item.contributorEmail || 'Anonymous'}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          {renderStatusBadge(item.status)}
                        </td>

                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {item.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveCulture(item)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                                title="Approve culture"
                              >
                                APPROVE
                              </button>
                            )}

                            {item.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectCulture(item)}
                                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                                title="Reject culture"
                              >
                                REJECT
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onPreviewCulture(item)}
                              className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 cursor-pointer"
                              title="View details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingCulture(item)}
                              className="p-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-blue-700 cursor-pointer"
                              title="Edit culture"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeletingCulture(item)}
                              className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                              title="Delete culture"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: USERS MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#FCFAF6] p-4 sm:p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-serif font-bold text-forest-900 text-base">
                Registered Community Explorers
              </h3>
              <p className="text-xs text-stone-500">
                Accounts authenticated via Firebase Google Identity. User passwords are encrypted and never stored on the platform.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={usersSearch}
                onChange={e => setUsersSearch(e.target.value)}
                placeholder="Search user by name, email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:ring-2 focus:ring-forest-700"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-[#FAF8F2] uppercase text-[10px] tracking-wider text-forest-900 border-b border-stone-200">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Authentication Provider</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-stone-400">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-forest-900 text-gold flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <span>{u.displayName.charAt(0)}</span>
                              )}
                            </div>
                            <span className="font-serif font-bold text-forest-900 text-sm">
                              {u.displayName}
                            </span>
                          </div>
                        </td>

                        <td className="p-4 font-mono text-stone-600">
                          {u.email}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[11px] border border-blue-200">
                            <span>Google OAuth</span>
                          </span>
                        </td>

                        <td className="p-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                              <ShieldCheck className="w-3 h-3 text-amber-700" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium text-[10px]">
                              User
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-stone-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: AUDIT HISTORY ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#FCFAF6] p-5 rounded-2xl border border-stone-200">
            <h3 className="font-serif font-bold text-forest-900 text-base">
              Administrator Audit Logs
            </h3>
            <p className="text-xs text-stone-500">
              Immutable historical record of content approvals, edits, and deletions recorded in the Firestore `adminActions` collection.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-stone-100">
              {adminAuditLogs.length === 0 ? (
                <div className="p-8 text-center text-stone-400 text-xs">
                  No administrative actions logged yet in this session.
                </div>
              ) : (
                adminAuditLogs.map((log) => (
                  <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-1 rounded-md font-mono font-bold text-[10px] uppercase bg-forest-900/5 text-forest-900 border border-forest-900/10">
                        {log.action}
                      </span>
                      <div>
                        <h4 className="font-bold text-forest-900 text-sm">
                          {log.contentTitle || log.contentId}
                        </h4>
                        <p className="text-[11px] text-stone-500">
                          Target: {log.contentType} • {log.notes || 'Executed by administrator'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-stone-400">
                      <span className="block font-mono">{log.adminEmail}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PLACE MODAL */}
      {editingPlace && (
        <EditPlaceModal
          place={editingPlace}
          isOpen={true}
          onClose={() => setEditingPlace(null)}
          onSaved={() => {
            setActionNotice('Place updated successfully.');
            setTimeout(() => setActionNotice(''), 3000);
          }}
        />
      )}

      {/* EDIT CULTURE MODAL */}
      {editingCulture && (
        <EditCultureModal
          item={editingCulture}
          isOpen={true}
          onClose={() => setEditingCulture(null)}
          onSaved={() => {
            setActionNotice('Cultural story updated successfully.');
            setTimeout(() => setActionNotice(''), 3000);
          }}
        />
      )}

      {/* DELETE PLACE CONFIRMATION MODAL */}
      {deletingPlace && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF8F2] border border-red-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="font-serif font-bold text-xl text-forest-900">
              Delete this place?
            </h3>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              This will remove <strong>"{deletingPlace.placeName}"</strong> and its associated uploaded images from the public map and database. This action cannot be easily undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingPlace(null)}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmDeletePlace}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'DELETING...' : 'DELETE PLACE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CULTURE CONFIRMATION MODAL */}
      {deletingCulture && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#FAF8F2] border border-red-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="font-serif font-bold text-xl text-forest-900">
              Delete this cultural contribution?
            </h3>

            <p className="text-xs text-charcoal-muted leading-relaxed">
              This will remove <strong>"{deletingCulture.title}"</strong> and its associated uploaded media from the cultural archive.
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeletingCulture(null)}
                className="px-5 py-2.5 rounded-full border border-stone-300 text-xs font-bold uppercase tracking-wider text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCulture}
                disabled={isDeleting}
                className="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
