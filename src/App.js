import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import LoginPage from './pages/auth/LoginPage';
import LandingPage from './pages/public/LandingPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsPage from './pages/public/TermsPage';
import ArchivePage from './pages/public/ArchivePage';
import LeaderboardPagePublic from './pages/public/LeaderboardPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Organizer Pages
// ... (omitting rest for brevity in instruction)

// Organizer Pages
import OrganizerLayout from './pages/organizer/OrganizerLayout';
import DashboardPage from './pages/organizer/DashboardPage';
import CreateEventPage from './pages/organizer/CreateEventPage';
import ManageEventPage from './pages/organizer/ManageEventPage';
import ParticipantsPage from './pages/organizer/ParticipantsPage';
import JudgesPage from './pages/organizer/JudgesPage';
import RubricBuilderPage from './pages/organizer/RubricBuilderPage';
import ResultsPage from './pages/organizer/ResultsPage';
import CertificatesPage from './pages/organizer/CertificatesPage';
import PublishPage from './pages/organizer/PublishPage';
import EventSettingsPage from './pages/organizer/EventSettingsPage';

// Judge Pages
import JudgeLayout from './pages/judge/JudgeLayout';
import JudgeDashboard from './pages/judge/JudgeDashboard';
import ScoringPage from './pages/judge/ScoringPage';
import RubricReviewPage from './pages/judge/RubricReviewPage';
import InvitePage from './pages/judge/InvitePage';

// Participant Pages
import ParticipantLayout from './pages/participant/ParticipantLayout';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';
import MyEventsPage from './pages/participant/MyEventsPage';
import LeaderboardPage from './pages/participant/LeaderboardPage';
import CertificatesPageParticipant from './pages/participant/CertificatesPage';
import AcceptInvitePage from './pages/participant/AcceptInvitePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public / Auth Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* New Public Pages */}
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/leaderboard" element={<LeaderboardPagePublic />} />

        {/* Organizer Routes */}
        <Route path="/organizer" element={<OrganizerLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
          <Route path="events/manage" element={<ManageEventPage />} />
          <Route path="events/settings" element={<EventSettingsPage />} />
          <Route path="participants" element={<ParticipantsPage />} />
          <Route path="judges" element={<JudgesPage />} />
          <Route path="rubrics" element={<RubricBuilderPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="publish" element={<PublishPage />} />
        </Route>

        {/* Judge Routes */}
        <Route path="/judge" element={<JudgeLayout />}>
          <Route path="dashboard" element={<JudgeDashboard />} />
          <Route path="scoring" element={<ScoringPage />} />
          <Route path="rubric" element={<RubricReviewPage />} />
          <Route path="invites" element={<InvitePage />} />
        </Route>

        {/* Participant Routes */}
        <Route path="/participant" element={<ParticipantLayout />}>
          <Route path="dashboard" element={<ParticipantDashboard />} />
          <Route path="events" element={<MyEventsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="certificates" element={<CertificatesPageParticipant />} />
          <Route path="invites" element={<AcceptInvitePage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
