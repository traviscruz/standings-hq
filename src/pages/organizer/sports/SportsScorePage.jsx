import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SportsScoringPage from '../../judge/SportsScoringPage';
import { colors } from '../../../styles/colors';

export default function SportsScorePage() {
  const { bracketId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: colors.inkMuted, cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: '0 0 16px', fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>arrow_back</span>
        Back to Dashboard
      </button>
      <SportsScoringPage bracketIdProp={bracketId} />
    </div>
  );
}
