import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';

export default function LandingPage() {
    const styles = {
        page: {
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
        },

        // ── NAV ──
        nav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: 'rgba(255, 255, 255, 0.93)',
            backdropFilter: 'blur(16px)',
            borderBottom: `1px solid ${colors.borderSoft}`,
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
        },
        navInner: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: '1320px',
            margin: '0 auto',
        },
        navLogo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
        },
        logoMark: {
            width: '32px',
            height: '32px',
            background: colors.navy,
            borderRadius: '7px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
        },
        logoText: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            fontWeight: 800,
            color: colors.ink,
            letterSpacing: '-0.03em',
        },
        logoAccent: {
            color: colors.accent,
        },
        navLinks: {
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        navActions: {
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
        },

        // ── HERO ──
        hero: {
            padding: '160px 40px 180px',
            minHeight: '95vh',
            display: 'flex',
            alignItems: 'center',
            maxWidth: '1320px',
            margin: '0 auto',
            width: '100%',
        },
        heroLayout: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '64px',
            alignItems: 'center',
            width: '100%',
        },
        liveBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            background: colors.accentBg,
            border: `1px solid ${colors.accentBgMid}`,
            color: colors.accentDeep,
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '5px 12px',
            borderRadius: '100px',
            marginBottom: '18px',
        },
        liveDot: {
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: colors.accent,
            flexShrink: 0,
        },
        liveDotSm: {
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: colors.accent,
            flexShrink: 0,
        },
        heroTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 60px)',
            fontWeight: 800,
            color: colors.ink,
            lineHeight: 1.05,
            letterSpacing: '-0.035em',
            marginBottom: '18px',
        },
        heroTitleAccent: {
            color: colors.accent,
        },
        heroTitleBlock: {
            display: 'block',
        },
        heroDesc: {
            fontSize: '16px',
            color: colors.inkMid,
            lineHeight: 1.7,
            maxWidth: '460px',
            marginBottom: '36px',
        },
        heroCta: {
            display: 'flex',
            gap: '12px',
            marginBottom: '40px',
            flexWrap: 'wrap',
        },
        heroTrust: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
        },
        trustDiv: {
            width: '1px',
            height: '22px',
            background: colors.border,
        },
        trustLabel: {
            fontSize: '12.5px',
            color: colors.inkMuted,
            fontWeight: 500,
        },
        trustBadges: {
            display: 'flex',
            gap: '6px',
        },
        trustBadge: {
            fontSize: '11.5px',
            fontWeight: 600,
            color: colors.inkMid,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            padding: '4px 10px',
            borderRadius: '100px',
        },

        // ── HERO VISUAL ──
        heroVisual: {
            position: 'relative',
            height: '480px',
        },
        hvCard: {
            position: 'absolute',
            background: colors.white,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
        },
        hvMain: {
            width: '360px',
            top: 0,
            right: 0,
        },
        hvScore: {
            width: '255px',
            top: '175px',
            left: '28px',
        },
        hvMini: {
            width: '215px',
            bottom: '40px',
            left: 0,
        },
        hvHead: {
            background: colors.navy,
            padding: '13px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        hvHeadTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12.5px',
            fontWeight: 700,
            color: colors.white,
        },
        hvLivePill: {
            fontSize: '10px',
            fontWeight: 700,
            color: colors.skyBright,
            background: colors.skyBg,
            border: '1px solid rgba(14, 165, 233, 0.25)',
            padding: '2px 8px',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        hvBody: {
            padding: '14px 16px',
        },
        rankList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
        },
        rrow: {
            display: 'grid',
            gridTemplateColumns: '28px 1fr auto',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
        },
        rrowG1: {
            display: 'grid',
            gridTemplateColumns: '28px 1fr auto',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            borderRadius: '8px',
            background: colors.accentBg,
            border: `1px solid ${colors.accentBgMid}`,
        },
        rrank: {
            fontSize: '12px',
            fontWeight: 700,
            textAlign: 'center',
            color: colors.inkMuted,
        },
        rrankGold: {
            fontSize: '14px',
            textAlign: 'center',
            color: colors.accent,
        },
        rname: {
            fontSize: '13px',
            fontWeight: 600,
            color: colors.ink,
        },
        rorg: {
            fontSize: '11px',
            color: colors.inkMuted,
            marginTop: '1px',
        },
        rscore: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 800,
            color: colors.navy,
        },
        rscoreGold: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 800,
            color: colors.accentDeep,
        },
        scHead: {
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            padding: '13px 15px',
        },
        scEv: {
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'rgba(255, 255, 255, 0.45)',
        },
        scName: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13.5px',
            fontWeight: 700,
            color: colors.white,
            marginTop: '2px',
        },
        scBody: {
            padding: '13px 15px',
        },
        critList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        },
        critRow: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        critLbl: {
            fontSize: '12px',
            color: colors.inkMid,
        },
        critVal: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12.5px',
            fontWeight: 700,
            color: colors.navy,
        },
        scTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: `1px solid ${colors.borderSoft}`,
        },
        scTotalLbl: {
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.inkSoft,
        },
        scTotalVal: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '22px',
            fontWeight: 800,
            color: colors.accentDeep,
        },
        miniTop: {
            padding: '12px 14px',
            borderBottom: `1px solid ${colors.borderSoft}`,
        },
        miniLbl: {
            fontSize: '10.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: colors.inkMuted,
        },
        miniBig: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '26px',
            fontWeight: 800,
            color: colors.navy,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            marginTop: '2px',
        },
        miniBigSub: {
            fontSize: '14px',
            fontWeight: 500,
            color: colors.inkMuted,
        },
        miniSub: {
            fontSize: '11px',
            color: colors.inkMuted,
            marginTop: '2px',
        },
        miniBody: {
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
        },
        mbarRow: {
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
        },
        mbarLbl: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 600,
            color: colors.inkSoft,
        },
        mbar: {
            height: '4px',
            background: colors.borderSoft,
            borderRadius: '100px',
            overflow: 'hidden',
        },
        mbarFill: {
            height: '100%',
            borderRadius: '100px',
            background: `linear-gradient(90deg, ${colors.navyLight}, ${colors.navy})`,
        },
        mbarFillAccent: {
            height: '100%',
            borderRadius: '100px',
            background: `linear-gradient(90deg, ${colors.accentMuted}, ${colors.accent})`,
        },

        // ── STATS BAR ──
        statsBar: {
            background: colors.navy,
            padding: '28px 40px',
            marginTop: '120px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        },
        statsBarInner: {
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            background: 'rgba(255, 255, 255, 0.07)',
            gap: '1px',
        },
        statItem: {
            background: colors.navy,
            padding: '22px 30px',
        },
        statNum: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '30px',
            fontWeight: 800,
            color: colors.white,
            letterSpacing: '-0.04em',
            lineHeight: 1,
        },
        statNumEm: {
            color: colors.skyBright,
            fontStyle: 'normal',
        },
        statLbl: {
            fontSize: '12.5px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '4px',
        },

        // ── FEATURES ──
        features: {
            padding: '80px 40px',
            maxWidth: '1320px',
            margin: '0 auto',
            width: '100%',
        },
        sEyebrow: {
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.accentDeep,
            marginBottom: '10px',
        },
        sTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 800,
            color: colors.ink,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '48px',
        },
        featGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            background: colors.border,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        },
        featCard: {
            background: colors.white,
            padding: '30px',
        },
        featIcon: {
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: colors.navyGlow,
            border: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px',
        },
        featTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15.5px',
            fontWeight: 700,
            color: colors.ink,
            marginBottom: '8px',
            letterSpacing: '-0.02em',
        },
        featDesc: {
            fontSize: '13.5px',
            color: colors.inkMid,
            lineHeight: 1.65,
        },

        // ── HOW IT WORKS ──
        howSection: {
            background: colors.navy,
            padding: '80px 40px',
        },
        howInner: {
            maxWidth: '1320px',
            margin: '0 auto',
        },
        howEyebrow: {
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.skyBright,
            marginBottom: '10px',
        },
        howTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 800,
            color: colors.white,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '52px',
        },
        stepsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
        },
        stepItem: {
            paddingRight: '16px',
        },
        stepBadge: {
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            color: colors.skyBright,
            marginBottom: '18px',
            position: 'relative',
            zIndex: 1,
        },
        stepBadgeHl: {
            width: '54px',
            height: '54px',
            borderRadius: '12px',
            background: colors.accent,
            border: `1px solid ${colors.accent}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '18px',
            fontWeight: 800,
            color: colors.white,
            marginBottom: '18px',
            position: 'relative',
            zIndex: 1,
            boxShadow: `0 4px 16px ${colors.accentGlow}`,
        },
        stepTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            fontWeight: 700,
            color: colors.white,
            marginBottom: '8px',
            letterSpacing: '-0.01em',
        },
        stepDesc: {
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.4)',
            lineHeight: 1.65,
        },

        // ── ROLES ──
        rolesSection: {
            padding: '80px 40px',
            maxWidth: '1320px',
            margin: '0 auto',
            width: '100%',
        },
        rolesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '48px',
        },
        roleCard: {
            borderRadius: '20px',
            overflow: 'hidden',
            border: `1px solid ${colors.border}`,
        },
        roleTopNavy: {
            background: colors.navy,
            padding: '28px',
        },
        roleTopWhite: {
            background: colors.white,
            padding: '28px',
        },
        roleTopAccent: {
            background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
            borderBottom: `1px solid ${colors.accentBgMid}`,
            padding: '28px',
        },
        roleIconNavy: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
        },
        roleIconLight: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(15, 31, 61, 0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
        },
        roleIconAccent: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: colors.accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '14px',
        },
        roleNameWhite: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '4px',
            color: colors.white,
        },
        roleNameDark: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '4px',
            color: colors.ink,
        },
        roleNameAccent: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '17px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '4px',
            color: colors.accentDeep,
        },
        roleTagFaint: {
            fontSize: '12.5px',
            fontWeight: 500,
            color: 'rgba(255, 255, 255, 0.4)',
        },
        roleTagMuted: {
            fontSize: '12.5px',
            fontWeight: 500,
            color: colors.inkMuted,
        },
        roleTagAccent: {
            fontSize: '12.5px',
            fontWeight: 500,
            color: colors.accentDeep,
        },
        roleBody: {
            padding: '20px 28px',
            background: colors.offWhite,
            borderTop: `1px solid ${colors.border}`,
        },
        rolePerks: {
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
        },

        // ── PRICING ──
        pricingSection: {
            padding: '120px 24px',
            background: 'linear-gradient(180deg, #fff 0%, #f1f5f9 100%)',
            position: 'relative',
            overflow: 'hidden',
        },
        pricingTopBorder: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, var(--border-soft), transparent)',
        },
        pricingEyebrow: {
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: colors.accentDeep,
            textAlign: 'center',
            margin: '0 auto 16px',
            display: 'block',
        },
        pricingTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(26px, 3vw, 38px)',
            fontWeight: 800,
            color: colors.ink,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            textAlign: 'center',
            marginBottom: '16px',
        },
        pricingDesc: {
            textAlign: 'center',
            color: colors.inkMuted,
            maxWidth: '600px',
            margin: '0 auto 64px',
            fontSize: '18px',
        },
        pricingGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto',
        },
        pricingCardFree: {
            padding: '56px',
            background: colors.white,
            borderRadius: '32px',
            border: `1px solid ${colors.borderSoft}`,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
        },
        pricingCardPro: {
            padding: '56px',
            background: colors.navy,
            borderRadius: '32px',
            border: `2px solid ${colors.accent}`,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            color: colors.white,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)',
        },
        pricingPopularBadge: {
            position: 'absolute',
            top: '24px',
            right: '24px',
            background: colors.accent,
            color: colors.white,
            padding: '6px 16px',
            borderRadius: '100px',
            fontSize: '11px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        },
        pricingPlanHeader: {
            marginBottom: '40px',
        },
        pricingPlanNameFree: {
            fontSize: '13px',
            fontWeight: 800,
            color: colors.navy,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '12px',
            opacity: 0.8,
        },
        pricingPlanNamePro: {
            fontSize: '13px',
            fontWeight: 800,
            color: colors.accentBright,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: '12px',
        },
        pricingPlanDescFree: {
            fontSize: '15px',
            color: colors.inkMuted,
            lineHeight: 1.55,
        },
        pricingPlanDescPro: {
            fontSize: '15px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.55,
        },
        pricingAmount: {
            marginBottom: '40px',
        },
        pricingPriceFree: {
            fontSize: '64px',
            fontWeight: 900,
            color: colors.navy,
            letterSpacing: '-0.04em',
        },
        pricingPricePro: {
            fontSize: '64px',
            fontWeight: 900,
            color: colors.white,
            letterSpacing: '-0.04em',
        },
        pricingBillingFree: {
            fontSize: '14px',
            color: colors.inkMuted,
            fontWeight: 600,
            marginTop: '4px',
        },
        pricingBillingPro: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.45)',
            fontWeight: 600,
            marginTop: '4px',
        },
        pricingFeatures: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            marginBottom: '56px',
            flex: 1,
        },
        pricingFeatureRowFree: {
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '15px',
            color: colors.inkSoft,
            fontWeight: 500,
        },
        pricingFeatureIconFree: {
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: '#F1F5F9',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
        },
        pricingFeatureIconPro: {
            width: '22px',
            height: '22px',
            borderRadius: '50%',
            background: colors.accent,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
        },
        pricingCtaFree: {
            width: '100%',
            justifyContent: 'center',
            borderRadius: '16px',
            padding: '16px',
        },
        pricingCtaPro: {
            width: '100%',
            justifyContent: 'center',
            borderRadius: '16px',
            padding: '16px',
            fontWeight: 900,
            fontSize: '16px',
        },

        // ── FOOTER CTA ──
        footerCta: {
            background: `linear-gradient(135deg, ${colors.navy}, ${colors.navyLight})`,
            padding: '80px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
        },
        footerCtaTitle: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(26px, 4vw, 46px)',
            fontWeight: 800,
            color: colors.white,
            letterSpacing: '-0.03em',
            marginBottom: '12px',
            position: 'relative',
        },
        footerCtaTitleEm: {
            color: colors.skyBright,
            fontStyle: 'normal',
        },
        footerCtaDesc: {
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.45)',
            marginBottom: '34px',
            position: 'relative',
        },
        footerCtaBtns: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            position: 'relative',
        },

        // ── FOOTER BAR ──
        footerBar: {
            background: colors.ink,
            padding: '20px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        footerBarText: {
            fontSize: '12.5px',
            color: 'rgba(255, 255, 255, 0.3)',
        },
        footerLinks: {
            display: 'flex',
            gap: '22px',
            listStyle: 'none',
            padding: 0,
            margin: 0,
        },
        footerLink: {
            fontSize: '12.5px',
            color: 'rgba(255, 255, 255, 0.3)',
            textDecoration: 'none',
        },
    };

    const freeFeatures = [
        'Unlimited basic events',
        'Mobile-first scoring app',
        'Live leaderboard public link',
        'Up to 50 participants per event',
        'Community forum support',
    ];

    const proFeatures = [
        { text: 'Everything in Essential', highlight: true },
        { text: 'Unlimited participants', highlight: false },
        { text: 'Branded certificate set generation', highlight: false },
        { text: 'Exportable CSV analytics & reports', highlight: false },
        { text: 'Bulk email judge invitations', highlight: false },
        { text: 'Priority 24/7 technical support', highlight: false },
    ];

    return (
        <div style={styles.page}>

            {/* ── NAV ── */}
            <nav style={styles.nav}>
                <div style={styles.navInner}>
                    <Link to="/" style={styles.navLogo}>
                        <div style={styles.logoMark}>
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3 13L6.5 7L10 10.5L12.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12.5" cy="5" r="2" fill={colors.accent} />
                            </svg>
                        </div>
                        <span style={styles.logoText}>Standings<span style={styles.logoAccent}>HQ</span></span>
                    </Link>
                    <ul style={styles.navLinks}>
                        <li><a href="#features" className="nav-link">Features</a></li>
                        <li><a href="#how-it-works" className="nav-link">How it works</a></li>
                        <li><a href="#roles" className="nav-link">Roles</a></li>
                        <li><a href="#pricing" className="nav-link">Pricing</a></li>
                    </ul>
                    <div style={styles.navActions}>
                        <Link to="/login" className="btn btn-ghost btn-sm">Sign in</Link>
                        <Link to="/register" className="btn btn-accent btn-sm">Get started free</Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section style={styles.hero}>
                <div style={styles.heroLayout}>
                    <div>
                        <div style={styles.liveBadge}>
                            <span style={styles.liveDot}></span>
                            Live scoring — available now
                        </div>
                        <h1 style={styles.heroTitle}>
                            <span style={styles.heroTitleBlock}>Run competitions.</span>
                            <span style={styles.heroTitleBlock}>Publish <span style={styles.heroTitleAccent}>standings.</span></span>
                            <span style={styles.heroTitleBlock}>Ship results.</span>
                        </h1>
                        <p style={styles.heroDesc}>
                            StandingsHQ is the end-to-end platform for professional and community competitions — rubric setup, live scoring, leaderboards, and official certificates in one place.
                        </p>
                        <div style={styles.heroCta}>
                            <Link to="/register" className="btn btn-accent btn-xl">Start your event free →</Link>
                            <Link to="/login" className="btn btn-navy btn-xl">Sign in</Link>
                        </div>
                        <div style={styles.heroTrust}>
                            <span style={styles.trustLabel}>Trusted format</span>
                            <div style={styles.trustDiv}></div>
                            <div style={styles.trustBadges}>
                                <span style={styles.trustBadge}>Accurate Results</span>
                                <span style={styles.trustBadge}>Live Events</span>
                                <span style={styles.trustBadge}>Verified Achievements</span>
                            </div>
                        </div>
                    </div>
                    <div style={styles.heroVisual} aria-hidden="true">
                        {/* Main leaderboard card */}
                        <div style={{ ...styles.hvCard, ...styles.hvMain }}>
                            <div style={styles.hvHead}>
                                <span style={styles.hvHeadTitle}>Interschool Debate Championships</span>
                                <span style={styles.hvLivePill}>
                                    <span style={styles.liveDotSm}></span>
                                    Live
                                </span>
                            </div>
                            <div style={styles.hvBody}>
                                <div style={styles.rankList}>
                                    <div style={styles.rrowG1}>
                                        <span style={styles.rrankGold}>🥇</span>
                                        <div>
                                            <div style={styles.rname}>Team Alpha — UST</div>
                                            <div style={styles.rorg}>Round 3 complete</div>
                                        </div>
                                        <span style={styles.rscoreGold}>94.6</span>
                                    </div>
                                    <div style={styles.rrow}>
                                        <span style={styles.rrank}>#2</span>
                                        <div>
                                            <div style={styles.rname}>Team Bravo — DLSU</div>
                                            <div style={styles.rorg}>Round 3 complete</div>
                                        </div>
                                        <span style={styles.rscore}>89.2</span>
                                    </div>
                                    <div style={styles.rrow}>
                                        <span style={styles.rrank}>#3</span>
                                        <div>
                                            <div style={styles.rname}>Team Delta — UP</div>
                                            <div style={styles.rorg}>Scoring…</div>
                                        </div>
                                        <span style={styles.rscore}>86.5</span>
                                    </div>
                                    <div style={styles.rrow}>
                                        <span style={styles.rrank}>#4</span>
                                        <div>
                                            <div style={styles.rname}>Team Echo — Ateneo</div>
                                            <div style={styles.rorg}>Round 2 complete</div>
                                        </div>
                                        <span style={styles.rscore}>83.1</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Score card */}
                        <div style={{ ...styles.hvCard, ...styles.hvScore }}>
                            <div style={styles.scHead}>
                                <div style={styles.scEv}>Judge: Prof. Reyes</div>
                                <div style={styles.scName}>Team Alpha · Round 3</div>
                            </div>
                            <div style={styles.scBody}>
                                <div style={styles.critList}>
                                    <div style={styles.critRow}><span style={styles.critLbl}>Content & Logic</span><span style={styles.critVal}>38/40</span></div>
                                    <div style={styles.critRow}><span style={styles.critLbl}>Delivery</span><span style={styles.critVal}>28/30</span></div>
                                    <div style={styles.critRow}><span style={styles.critLbl}>Rebuttal</span><span style={styles.critVal}>18/20</span></div>
                                    <div style={styles.critRow}><span style={styles.critLbl}>Teamwork</span><span style={styles.critVal}>9/10</span></div>
                                </div>
                                <div style={styles.scTotal}>
                                    <span style={styles.scTotalLbl}>Total</span>
                                    <span style={styles.scTotalVal}>94.6</span>
                                </div>
                            </div>
                        </div>
                        {/* Mini progress card */}
                        <div style={{ ...styles.hvCard, ...styles.hvMini }}>
                            <div style={styles.miniTop}>
                                <div style={styles.miniLbl}>Event progress</div>
                                <div style={styles.miniBig}>
                                    72<span style={styles.miniBigSub}>/100</span>
                                </div>
                                <div style={styles.miniSub}>scores submitted</div>
                            </div>
                            <div style={styles.miniBody}>
                                <div style={styles.mbarRow}>
                                    <div style={styles.mbarLbl}><span>Round 1</span><span>100%</span></div>
                                    <div style={styles.mbar}><div style={{ ...styles.mbarFillAccent, width: '100%' }}></div></div>
                                </div>
                                <div style={styles.mbarRow}>
                                    <div style={styles.mbarLbl}><span>Round 2</span><span>100%</span></div>
                                    <div style={styles.mbar}><div style={{ ...styles.mbarFill, width: '100%' }}></div></div>
                                </div>
                                <div style={styles.mbarRow}>
                                    <div style={styles.mbarLbl}><span>Round 3</span><span>44%</span></div>
                                    <div style={styles.mbar}><div style={{ ...styles.mbarFill, width: '44%' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ── */}
            <div style={styles.statsBar}>
                <div style={styles.statsBarInner}>
                    <div style={styles.statItem}>
                        <div style={styles.statNum}>3<em style={styles.statNumEm}>+</em></div>
                        <div style={styles.statLbl}>User roles supported</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNum}><em style={styles.statNumEm}>∞</em></div>
                        <div style={styles.statLbl}>Events per account</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNum}><em style={styles.statNumEm}>Real-</em>time</div>
                        <div style={styles.statLbl}>Live score updates</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statNum}>1<em style={styles.statNumEm}>-click</em></div>
                        <div style={styles.statLbl}>Certificate generation</div>
                    </div>
                </div>
            </div>

            {/* ── FEATURES ── */}
            <section style={styles.features} id="features">
                <div style={styles.sEyebrow}>Platform features</div>
                <h2 style={styles.sTitle}>Everything a competition<br />organizer actually needs.</h2>
                <div style={styles.featGrid}>
                    {[
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="6" height="5" rx="1.5" stroke={colors.navy} strokeWidth="1.5" /><rect x="11" y="3" width="6" height="5" rx="1.5" stroke={colors.navy} strokeWidth="1.5" /><rect x="3" y="12" width="6" height="5" rx="1.5" stroke={colors.navy} strokeWidth="1.5" /><rect x="11" y="12" width="6" height="5" rx="1.5" stroke={colors.navy} strokeWidth="1.5" /></svg>,
                            title: 'Rubric Builder',
                            desc: 'Design weighted scoring rubrics from scratch — multiple criteria, custom point values, instant calculations.',
                        },
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 15L7 7L11 11L14 5" stroke={colors.navy} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="14" cy="5" r="2" stroke={colors.navy} strokeWidth="1.5" /></svg>,
                            title: 'Live Leaderboards',
                            desc: 'Rankings refresh instantly as scores are submitted. Display on-screen or share the public link with audiences.',
                        },
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 3H14C15.1 3 16 3.9 16 5V15C16 16.1 15.1 17 14 17H6C4.9 17 4 16.1 4 15V5C4 3.9 4.9 3 6 3Z" stroke={colors.navy} strokeWidth="1.5" /><path d="M8 8H12M8 11H12M8 14H10" stroke={colors.navy} strokeWidth="1.5" strokeLinecap="round" /></svg>,
                            title: 'Certificate Generation',
                            desc: 'Auto-fill certificates for every participant. Custom templates, bulk download, official-grade output in seconds.',
                        },
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="7" r="3" stroke={colors.navy} strokeWidth="1.5" /><path d="M4 17C4 14.2 6.7 12 10 12C13.3 12 16 14.2 16 17" stroke={colors.navy} strokeWidth="1.5" strokeLinecap="round" /></svg>,
                            title: 'Role-based Dashboards',
                            desc: 'Organizers, judges, and participants each get a focused workspace — no shared clutter, no confusion.',
                        },
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="2" stroke={colors.navy} strokeWidth="1.5" /><path d="M3 8H17M8 8V16" stroke={colors.navy} strokeWidth="1.5" strokeLinecap="round" /></svg>,
                            title: 'Invite Management',
                            desc: 'Email invitations for judges and participants. Track acceptances, send reminders, manage responses in one view.',
                        },
                        {
                            icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={colors.navy} strokeWidth="1.5" /><path d="M10 6V10L13 12" stroke={colors.navy} strokeWidth="1.5" strokeLinecap="round" /></svg>,
                            title: 'Event Archive',
                            desc: 'Every published event is permanently archived — full results, winners, and highlights searchable by the public.',
                        },
                    ].map((f) => (
                        <div key={f.title} style={styles.featCard} className="feat-card">
                            <div style={styles.featIcon}>{f.icon}</div>
                            <div style={styles.featTitle}>{f.title}</div>
                            <div style={styles.featDesc}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section style={styles.howSection} id="how-it-works">
                <div style={styles.howInner}>
                    <div style={styles.howEyebrow}>How it works</div>
                    <h2 style={styles.howTitle}>From setup to published results<br />in four steps.</h2>
                    <div style={styles.stepsGrid}>
                        {[
                            { num: '01', title: 'Create your event', desc: 'Name it, set the date, build scoring rubrics, and configure competition rounds.', hl: false },
                            { num: '02', title: 'Invite everyone', desc: 'Send email invites. Each role gets their own workspace — no admin overhead required.', hl: false },
                            { num: '03', title: 'Score live', desc: 'Judges score from any device. Standings update instantly. Audiences follow in real time.', hl: true },
                            { num: '04', title: 'Publish & archive', desc: 'Finalize results, generate certificates for all, publish to the public archive.', hl: false },
                        ].map((s) => (
                            <div key={s.num} style={styles.stepItem}>
                                <div style={s.hl ? styles.stepBadgeHl : styles.stepBadge}>{s.num}</div>
                                <div style={styles.stepTitle}>{s.title}</div>
                                <div style={styles.stepDesc}>{s.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── ROLES ── */}
            <section style={styles.rolesSection} id="roles">
                <div style={styles.sEyebrow}>Who it's built for</div>
                <h2 style={styles.sTitle}>Three roles. One platform.<br />Zero confusion.</h2>
                <div style={styles.rolesGrid}>
                    {/* Organizer */}
                    <div style={styles.roleCard}>
                        <div style={styles.roleTopNavy}>
                            <div style={styles.roleIconNavy}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="3" y="3" width="6" height="5" rx="1.2" fill="rgba(255,255,255,0.5)" />
                                    <rect x="11" y="3" width="6" height="5" rx="1.2" fill={colors.accent} opacity="0.8" />
                                    <rect x="3" y="12" width="14" height="5" rx="1.2" fill="rgba(255,255,255,0.15)" />
                                </svg>
                            </div>
                            <div style={styles.roleNameWhite}>Organizer</div>
                            <div style={styles.roleTagFaint}>Full platform control</div>
                        </div>
                        <div style={styles.roleBody}>
                            <div style={styles.rolePerks}>
                                {['Create and manage unlimited events', 'Build custom scoring rubrics', 'Invite and track judges & participants', 'Publish results and generate certificates'].map(p => (
                                    <div key={p} className="perk">{p}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Judge */}
                    <div style={styles.roleCard}>
                        <div style={styles.roleTopWhite}>
                            <div style={styles.roleIconLight}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M3 15L7 7L11 11L14 5" stroke={colors.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="14" cy="5" r="2.5" fill={colors.navy} />
                                </svg>
                            </div>
                            <div style={styles.roleNameDark}>Judge</div>
                            <div style={styles.roleTagMuted}>Focused scoring workspace</div>
                        </div>
                        <div style={styles.roleBody}>
                            <div style={styles.rolePerks}>
                                {['Accept event invitations via email', 'Review assigned rubrics before the event', 'Score participants via clean live interface', 'View all assigned events and pending tasks'].map(p => (
                                    <div key={p} className="perk">{p}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Participant */}
                    <div style={styles.roleCard}>
                        <div style={styles.roleTopAccent}>
                            <div style={styles.roleIconAccent}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M10 3L12.5 8.5H18L13.5 11.5L15.5 17.5L10 14L4.5 17.5L6.5 11.5L2 8.5H7.5L10 3Z" fill={colors.accent} opacity="0.85" />
                                </svg>
                            </div>
                            <div style={styles.roleNameAccent}>Participant</div>
                            <div style={styles.roleTagAccent}>Your competition journey</div>
                        </div>
                        <div style={styles.roleBody}>
                            <div style={styles.rolePerks}>
                                {['Accept event invitations', 'Follow live leaderboards during competition', 'Track your schedule and assignments', 'Download official certificates'].map(p => (
                                    <div key={p} className="perk">{p}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING ── */}
            <section style={styles.pricingSection} id="pricing">
                <div style={styles.pricingTopBorder}></div>
                <div style={styles.pricingEyebrow}>Simple Pricing</div>
                <h2 style={styles.pricingTitle}>Ready to elevate your competition?</h2>
                <p style={styles.pricingDesc}>Transparent pricing designed for events of every scale. No hidden fees, just pure competition focus.</p>

                <div style={styles.pricingGrid}>
                    {/* Free Plan */}
                    <div style={styles.pricingCardFree}>
                        <div style={styles.pricingPlanHeader}>
                            <h3 style={styles.pricingPlanNameFree}>Essential</h3>
                            <p style={styles.pricingPlanDescFree}>The core essentials for small clubs and local house matches.</p>
                        </div>
                        <div style={styles.pricingAmount}>
                            <div style={styles.pricingPriceFree}>₱0</div>
                            <div style={styles.pricingBillingFree}>Free forever • No credit card required</div>
                        </div>
                        <div style={styles.pricingFeatures}>
                            {freeFeatures.map(f => (
                                <div key={f} style={styles.pricingFeatureRowFree}>
                                    <div style={styles.pricingFeatureIconFree}>
                                        <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.navy }}>check</span>
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>
                        <Link to="/register" className="btn btn-navy btn-xl" style={styles.pricingCtaFree}>Start for free</Link>
                    </div>

                    {/* Pro Plan */}
                    <div style={styles.pricingCardPro}>
                        <div style={styles.pricingPopularBadge}>Most Popular</div>
                        <div style={styles.pricingPlanHeader}>
                            <h3 style={styles.pricingPlanNamePro}>Pro Elite</h3>
                            <p style={styles.pricingPlanDescPro}>Unleash the full power of StandingsHQ for institutional events.</p>
                        </div>
                        <div style={styles.pricingAmount}>
                            <div style={styles.pricingPricePro}>₱499</div>
                            <div style={styles.pricingBillingPro}>Per event access • Priority features</div>
                        </div>
                        <div style={styles.pricingFeatures}>
                            {proFeatures.map((f, i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    fontSize: '15px',
                                    color: f.highlight ? colors.white : 'rgba(255,255,255,0.85)',
                                    fontWeight: f.highlight ? 700 : 500,
                                }}>
                                    <div style={styles.pricingFeatureIconPro}>
                                        <span className="material-symbols-rounded" style={{ fontSize: '14px', color: colors.white }}>verified</span>
                                    </div>
                                    {f.text}
                                </div>
                            ))}
                        </div>
                        <Link to="/register" className="btn btn-accent btn-xl" style={styles.pricingCtaPro}>Go Pro now</Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER CTA ── */}
            <div style={styles.footerCta}>
                <h2 style={styles.footerCtaTitle}>
                    Ready to run your next <em style={styles.footerCtaTitleEm}>competition?</em>
                </h2>
                <p style={styles.footerCtaDesc}>Powerful enough for institutions. Simple enough for everyone. Set up in minutes.</p>
                <div style={styles.footerCtaBtns}>
                    <Link to="/register" className="btn btn-accent btn-xl">Create a free account →</Link>
                    <Link to="/login" className="btn btn-ghost-white btn-xl">Sign in</Link>
                </div>
            </div>

            {/* ── FOOTER BAR ── */}
            <div style={styles.footerBar}>
                <p style={styles.footerBarText}>© 2025 StandingsHQ. The world-class platform for every competition.</p>
                <ul style={styles.footerLinks}>
                    <li><Link to="/privacy" style={styles.footerLink}>Privacy</Link></li>
                    <li><Link to="/terms" style={styles.footerLink}>Terms</Link></li>
                    <li><Link to="#" style={styles.footerLink}>Support</Link></li>
                    <li><Link to="#" style={styles.footerLink}>Docs</Link></li>
                </ul>
            </div>
        </div>
    );
}