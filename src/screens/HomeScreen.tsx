import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { AUTH_API_CLIENT } from '../api/apiClient';
import { normalizeTaskRecord } from '../utils/taskNormalization';

import { colors, screenHorizontalPadding } from '../constants/theme';
import { hscale, mscale, wscale } from '../helpers/metric';
import { useAuthStore } from '../stores/authStore';
import AvatarView from '../components/avatarView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Quick-do chips ──────────────────────────────────────────────────────────
const QUICK_DO = [
  { id: '1', label: 'Learn with AI',    icon: 'star-four-points-outline', route: '/kemiMasteryHub' },
  { id: '2', label: 'Make Money',       icon: 'wallet-outline',            route: '/task' },
  { id: '3', label: 'Find\nScholarship', icon: 'school-outline',            route: '/scholarship' },
];

// ─── Academic tiles ───────────────────────────────────────────────────────────
const ACADEMIC_TILES = [
  { label: 'STUDY\nMATERIALS',  icon: 'book-open-outline',    route: '/courses/courses', variant: 'white' as const },
  { label: 'UPLOAD\nMATERIALS', icon: 'cloud-upload-outline', route: '/upload',           variant: 'light' as const },
  { label: 'LEARN NEW\nCOURSES',icon: 'school-outline',       route: '/courses/academy',  variant: 'dark'  as const },
];

// ─── Gigs tiles ───────────────────────────────────────────────────────────────
const GIGS_TILES = [
  { label: 'TASK',     icon: 'format-list-bulleted', route: '/task',                variant: 'white' as const },
  { label: 'SERVICES', icon: 'tag-outline',           route: '/(services)/services', variant: 'light' as const },
  { label: 'EARNING',  icon: 'currency-ngn',          route: '/earning',             variant: 'green' as const },
];

const OPP_CARDS = [
  { 
    id: '1', 
    tag: 'SCHOLARSHIP', 
    tagBg: 'rgba(168, 85, 247, 0.15)',
    tagColor: '#3D1A6E',
    title: 'Scholarship',
    subtitle: null,
    btnLabel: 'Apply Now',
    btnBg: '#9133E8', // Match the light purple of the second button
    route: '/scholarship', 
    imageBg: '#E2E8F0', // placeholder background for image
    imageSource: require('../../assets/images/campus.png'),
  },
  { 
    id: '2', 
    tag: 'PAID TASK', 
    tagBg: 'rgba(168, 85, 247, 0.15)', 
    tagColor: '#8B2BE2',
    title: 'Earn ₦15,000 per task', 
    subtitle: null,
    btnLabel: 'Start Task',
    btnBg: '#9133E8', // Bright vibrant purple
    route: '/task',    
    imageBg: '#E2E8F0', // placeholder background for image
    imageSource: require('../../assets/images/freelance-woman.png'),
  },
];

// ─── Earning stories ──────────────────────────────────────────────────────────
const STORIES = [
  {
    id: '1',
    quote: '"I got a freelance gig using Solva services. Just like Fiverr!"',
    name: 'Chidi',
    uni: 'UNN',
    // <-- ADD CHIDI'S IMAGE HERE -->
    avatar: require('../../assets/images/avatar-1.png'),
    // avatar: null,
  },
  {
    id: '2',
    quote: '"Being Premium means I get rewarded for helping others learn."',
    name: 'Emeka',
    uni: 'FUTA',
    // <-- ADD EMEKA'S IMAGE HERE -->
    avatar: require('../../assets/images/avatar-2.png'),
    // avatar: null,
  },
];

// ─── Tile variant styles helper ───────────────────────────────────────────────
function tileStyle(variant: 'white' | 'light' | 'dark' | 'green') {
  switch (variant) {
    case 'white': return { bg: '#FFFFFF',  iconColor: colors.primary, textColor: '#18181B' };
    case 'dark':  return { bg: '#1E0045',  iconColor: '#FFFFFF',      textColor: '#FFFFFF' };
    case 'green': return { bg: '#F0FFF4',  iconColor: '#16A34A',      textColor: '#16A34A', border: '#4ADE80' };
    default:      return { bg: '#F3EEFF',  iconColor: colors.primary, textColor: '#18181B' };
  }
}

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const profile = user?.profile;
  const firstName = profile?.fullName?.trim()?.split(' ')?.[0] ?? 'User';

  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await AUTH_API_CLIENT.get('/tasks');
      const payload = res.data;
      if (Array.isArray(payload?.data?.tasks)) return payload.data.tasks;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.tasks)) return payload.tasks;
      if (Array.isArray(payload)) return payload;
      return [];
    },
  });

  const activeGigs = React.useMemo(() => {
    return (tasksData || []).map(normalizeTaskRecord).slice(0, 3);
  }, [tasksData]);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.avatarWrap}>
            <AvatarView size={mscale(42)} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.greetText}>Hello, {firstName || 'Daniel'}</Text>
            <Text style={styles.subText} numberOfLines={1}>
              Here's what happening today.
            </Text>
          </View>
        </View>

        {/* ── Hero / Community Card ──────────────────────────────── */}
        <View style={styles.heroCard}>
          {/* "SOLVA COMMUNITY" filled pill tag */}
          <View style={styles.heroTag}>
            <Text style={styles.heroTagText}>SOLVA COMMUNITY</Text>
          </View>

          <Text style={styles.heroTitle}>Learn. Earn. Grow.</Text>
          <Text style={styles.heroSubtitle}>Always a good time to learn and earn.</Text>

          {/* Social proof row */}
          <View style={styles.socialRow}>
            <View style={styles.miniAvatarsRow}>
              {/* <-- ADD YOUR 1ST IMAGE HERE --> */}
              <Image source={require('../../assets/images/avatar-1.png')} style={[styles.miniAvatarImg, { zIndex: 3 }]} />
              {/* <View style={[styles.miniAvatarImg, { zIndex: 3, backgroundColor: 'rgba(255,255,255,0.2)' }]} /> */}

              {/* <-- ADD YOUR 2ND IMAGE HERE --> */}
              <Image source={require('../../assets/images/avatar-2.png')} style={[styles.miniAvatarImg, styles.miniAvatarOverlap, { zIndex: 2 }]} />
              {/* <View style={[styles.miniAvatarImg, styles.miniAvatarOverlap, { zIndex: 2, backgroundColor: 'rgba(255,255,255,0.2)' }]} /> */}
              <View style={[styles.miniAvatarImg, styles.miniAvatarOverlap, styles.miniAvatarCount, { zIndex: 1 }]}>
                <Text style={styles.miniAvatarCountText}>1k+</Text>
              </View>
            </View>
            <Text style={styles.onlineText}>1,000+ Students online</Text>
          </View>

          {/* faint rocket bg icon */}
          <Icon
            name="rocket-launch"
            size={mscale(160)}
            color="rgba(255,255,255,0.12)"
            style={styles.heroRocket}
          />
        </View>

        {/* ── What would you like to do? ───────────────────────────── */}
        <Text style={styles.sectionHeading}>What would you like to do today?</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickDoRow}
        >
          {QUICK_DO.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickDoCard}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.quickDoIconBg}>
                <Icon name={item.icon as any} size={mscale(24)} color={colors.primary} />
              </View>
              <Text style={styles.quickDoLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── ACADEMICS & STUDY TOOLS ──────────────────────────────── */}
        <View style={[styles.sectionCard, { borderColor: '#C4B5FD' }]}>
          <View style={[styles.sectionAccent, { backgroundColor: '#7C3AED' }]} />
          <View style={styles.sectionCardBody}>
            <Text style={styles.sectionCardTitle}>ACADEMICS &amp; STUDY TOOLS</Text>
            <Text style={styles.sectionCardSub}>
              📚 Get study materials, upload yours to earn royalties, or chat with Kemi.
            </Text>
          </View>
        </View>

        <View style={styles.tilesGrid}>
          {ACADEMIC_TILES.map((t) => {
            const vs = tileStyle(t.variant);
            return (
              <TouchableOpacity
                key={t.label}
                style={[
                  styles.tile,
                  { backgroundColor: vs.bg },
                  vs.border ? { borderWidth: 1.5, borderColor: vs.border } : null,
                ]}
                activeOpacity={0.78}
                onPress={() => router.push(t.route as any)}
              >
                <Icon name={t.icon as any} size={mscale(28)} color={vs.iconColor} />
                <Text style={[styles.tileLabel, { color: vs.textColor }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CAMPUS GIGS & WALLET ─────────────────────────────────── */}
        <View style={[styles.sectionCard, { marginTop: hscale(4), borderColor: '#D1FAE5' }]}>
          <View style={[styles.sectionAccent, { backgroundColor: '#22C55E' }]} />
          <LinearGradient
            colors={['#F5EEFF', '#EAD4FF', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gigsGradientBody}
          >
            <Text style={styles.gigsSectionTitle}>CAMPUS GIGS &amp; WALLET</Text>
            <Text style={styles.gigsSectionSub}>
              💸 Pick active brand tasks, offer your skills, and cash out instantly.
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.tilesGrid}>
          {GIGS_TILES.map((t) => {
            const vs = tileStyle(t.variant);
            return (
              <TouchableOpacity
                key={t.label}
                style={[
                  styles.tile,
                  { backgroundColor: vs.bg },
                  vs.border ? { borderWidth: 1.5, borderColor: vs.border } : null,
                ]}
                activeOpacity={0.78}
                onPress={() => router.push(t.route as any)}
              >
                <Icon name={t.icon as any} size={mscale(28)} color={vs.iconColor} />
                <Text style={[styles.tileLabel, { color: vs.textColor }]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Opportunities ────────────────────────────────────────── */}
        <View style={styles.rowHeader}>
          <Text style={styles.rowHeaderLabel}>OPPORTUNITIES FOR YOU</Text>
          <Icon name="arrow-right" size={mscale(18)} color={colors.primary} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {OPP_CARDS.map((card) => (
            <View key={card.id} style={styles.oppCard}>
              <View style={[styles.oppImageArea, { backgroundColor: card.imageBg, overflow: 'hidden' }]}>
                {card.imageSource && (
                  <Image 
                    source={card.imageSource} 
                    style={[StyleSheet.absoluteFillObject, { width: '100%', height: '100%' }]} 
                    resizeMode="cover" 
                  />
                )}
                <View style={[styles.oppTagPill, { backgroundColor: card.tagBg }]}>
                  <Text style={[styles.oppTagText, { color: card.tagColor }]}>{card.tag}</Text>
                </View>
              </View>
              <View style={styles.oppContentArea}>
                <View style={{ minHeight: hscale(44), justifyContent: 'flex-start' }}>
                  <Text style={styles.oppTitle} numberOfLines={2}>{card.title}</Text>
                  {card.subtitle && (
                    <Text style={styles.oppSubtitle}>{card.subtitle}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.oppBtn, { backgroundColor: card.btnBg }]}
                  activeOpacity={0.8}
                  onPress={() => router.push(card.route as any)}
                >
                  <Text style={styles.oppBtnText}>{card.btnLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Earning Stories ──────────────────────────────────────── */}
        <View style={[styles.rowHeader, { alignItems: 'flex-start' }]}>
          <Text style={styles.earningStoriesTitle}>Earning{'\n'}Stories</Text>
          <View style={styles.featuredPill}>
            <Text style={styles.featuredPillText}>GET FEATURED &amp; EARN MORE THIS WEEK</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
        >
          {STORIES.map((s) => (
            <View key={s.id} style={styles.storyCard}>
              <Icon name="format-quote-open" size={mscale(56)} color="#E6D5F2" style={{ marginBottom: hscale(8), marginTop: hscale(-8), marginLeft: wscale(-8) }} />
              <View style={{ minHeight: hscale(90) }}>
                <Text style={styles.storyQuote}>{s.quote}</Text>
              </View>
              <View style={styles.storyUserRow}>
                {s.avatar ? (
                  <Image source={s.avatar} style={styles.storyAvatar} />
                ) : (
                  <View style={[styles.storyAvatar, { backgroundColor: '#D4D4D8' }]} />
                )}
                <View>
                  <Text style={styles.storyName}>{s.name}</Text>
                  <Text style={styles.storyUni}>{s.uni}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* ── Active Gigs ──────────────────────────────────────────── */}
        <View style={styles.rowHeader}>
          <Text style={styles.activeGigsTitle}>Active Gigs</Text>
          <TouchableOpacity onPress={() => router.push('/task')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* gig item */}
        {isLoadingTasks ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
        ) : activeGigs.length > 0 ? (
          activeGigs.map((gig) => (
            <TouchableOpacity
              key={gig.id}
              style={[styles.gigItem, { marginBottom: hscale(12) }]}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/task-details', params: { id: gig.id } } as any)}
            >
              <View style={styles.gigIconBox}>
                {gig.sponsorLogo ? (
                  <Image source={{ uri: gig.sponsorLogo }} style={{ width: '100%', height: '100%', borderRadius: mscale(12) }} resizeMode="cover" />
                ) : (
                  <Icon name="bullhorn-outline" size={mscale(20)} color={colors.primary} />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: wscale(12) }}>
                <Text style={styles.gigTitle} numberOfLines={1}>{gig.title || 'Untitled Gig'}</Text>
                <Text style={styles.gigSub} numberOfLines={1}>{gig.brandName || 'Anonymous'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.gigPrice}>₦{gig.totalPool?.toLocaleString() || '0'}</Text>
                <Text style={styles.gigStatus}>IN PROGRESS</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: 'center', color: '#71717A', marginTop: 10, fontFamily: 'Inter-Regular' }}>No active gigs right now.</Text>
        )}

        {/* spacer for FAB */}
        <View style={{ height: hscale(120) }} />
      </ScrollView>

      {/* ── Kemi Floating Action Button ─────────────────────────────── */}
      <TouchableOpacity
        style={styles.kemiFab}
        activeOpacity={0.85}
        onPress={() => router.push('/kemiMasteryHub')}
      >
        {/* <-- KEMI FAB ICON/IMAGE --> */}
        <Image source={require('../../assets/images/ask-kemi-fab-icon.png')} style={{width: '100%', height: '100%', borderRadius: mscale(32)}} resizeMode="cover" />
      </TouchableOpacity>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F5FA',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: screenHorizontalPadding,
    paddingTop: hscale(52),
    paddingBottom: hscale(20),
  },

  // ── Header ────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hscale(20),
  },
  avatarWrap: {
    marginRight: wscale(12),
  },
  headerText: {
    flex: 1,
  },
  greetText: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(16),
    color: '#18181B',
  },
  subText: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(12),
    color: '#71717A',
    marginTop: 2,
  },

  // ── Hero card ─────────────────────────────────────────────
  heroCard: {
    borderRadius: mscale(24),
    paddingHorizontal: wscale(24),
    paddingTop: hscale(24),
    paddingBottom: hscale(28),
    marginBottom: hscale(24),
    overflow: 'hidden',
    backgroundColor: '#6B21A8',
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: mscale(30),
    paddingHorizontal: wscale(16),
    paddingVertical: hscale(8),
    marginBottom: hscale(20),
  },
  heroTagText: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(11),
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(38),
    color: '#FFFFFF',
    lineHeight: mscale(46),
    marginBottom: hscale(10),
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(16),
    color: 'rgba(255,255,255,0.92)',
    marginBottom: hscale(28),
    lineHeight: mscale(24),
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wscale(12),
  },
  miniAvatarImg: {
    width: mscale(40),
    height: mscale(40),
    borderRadius: mscale(20),
    borderWidth: 2,
    borderColor: '#6B21A8',
  },
  miniAvatarOverlap: {
    marginLeft: -mscale(14),
  },
  miniAvatarCount: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarCountText: {
    color: '#FFFFFF',
    fontSize: mscale(12),
    fontFamily: 'Inter-Bold',
  },
  onlineText: {
    fontFamily: 'Inter-Medium',
    fontSize: mscale(14),
    color: '#FFFFFF',
  },
  heroRocket: {
    position: 'absolute',
    right: -mscale(30),
    top: '20%',
  },

  // ── Section headings ──────────────────────────────────────────
  sectionHeading: {
    fontFamily: 'Inter-Medium',
    fontSize: mscale(15),
    color: colors.primary,
    marginBottom: hscale(14),
  },

  // ── Quick-do chips ────────────────────────────────────────────
  quickDoRow: {
    gap: wscale(12),
    paddingBottom: hscale(24),
    paddingRight: wscale(4),
  },
  quickDoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: mscale(16),
    paddingVertical: hscale(16),
    paddingHorizontal: wscale(16),
    alignItems: 'center',
    width: wscale(100),
    ...Platform.select({
      ios: { shadowColor: '#6207A0', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  quickDoIconBg: {
    width: mscale(44),
    height: mscale(44),
    borderRadius: mscale(22),
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hscale(10),
  },
  quickDoLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: mscale(11),
    color: '#18181B',
    textAlign: 'center',
    lineHeight: mscale(16),
  },

  // ── Section banner cards ──────────────────────────────────────
  sectionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: mscale(12),
    marginBottom: hscale(12),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EDE9F4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  sectionAccent: {
    width: wscale(5),
  },
  sectionCardBody: {
    flex: 1,
    paddingHorizontal: wscale(14),
    paddingVertical: hscale(14),
  },
  sectionCardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(12),
    color: '#18181B',
    letterSpacing: 0.3,
    marginBottom: hscale(4),
  },
  sectionCardSub: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(12),
    color: '#71717A',
    lineHeight: mscale(18),
  },
  gigsGradientBody: {
    flex: 1,
    paddingHorizontal: wscale(14),
    paddingVertical: hscale(14),
    borderTopRightRadius: mscale(12),
    borderBottomRightRadius: mscale(12),
  },
  gigsSectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(12),
    color: '#18181B',
    letterSpacing: 0.3,
    marginBottom: hscale(4),
  },
  gigsSectionSub: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(12),
    color: '#3D1A6E',
    lineHeight: mscale(18),
    fontStyle: 'italic',
  },

  // ── Tile grids ────────────────────────────────────────────────
  tilesGrid: {
    flexDirection: 'row',
    gap: wscale(10),
    marginBottom: hscale(20),
  },
  tile: {
    flex: 1,
    borderRadius: mscale(14),
    paddingVertical: hscale(22),
    paddingHorizontal: wscale(6),
    alignItems: 'center',
    justifyContent: 'center',
    gap: hscale(10),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  tileLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(10),
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: mscale(14),
  },

  // ── Row headers ───────────────────────────────────────────────
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hscale(14),
  },
  rowHeaderLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(11),
    color: '#71717A',
    letterSpacing: 0.8,
  },

  // ── Opportunity cards ─────────────────────────────────────────
  hScroll: {
    gap: wscale(14),
    paddingBottom: hscale(24),
    paddingRight: wscale(4),
  },
  oppCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: mscale(20),
    padding: wscale(8),
    width: wscale(240),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  oppImageArea: {
    height: hscale(130),
    borderTopLeftRadius: mscale(16),
    borderTopRightRadius: mscale(16),
    borderBottomLeftRadius: mscale(4),
    borderBottomRightRadius: mscale(4),
    padding: wscale(12),
    marginBottom: hscale(12),
    justifyContent: 'flex-start',
  },
  oppTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: wscale(10),
    paddingVertical: hscale(6),
    borderRadius: mscale(12),
  },
  oppTagText: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(9),
    letterSpacing: 0.3,
  },
  oppContentArea: {
    paddingHorizontal: wscale(6),
    paddingBottom: hscale(4),
  },
  oppTitle: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(13),
    color: '#52525B',
    marginBottom: hscale(4),
  },
  oppSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(11),
    color: '#71717A',
    marginBottom: hscale(8),
  },
  oppBtn: {
    borderRadius: mscale(30),
    paddingVertical: hscale(12),
    alignItems: 'center',
    marginTop: hscale(4),
  },
  oppBtnText: {
    fontFamily: 'Inter-Medium',
    fontSize: mscale(13),
    color: '#FFFFFF',
  },

  // ── Earning Stories ───────────────────────────────────────────
  earningStoriesTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(18),
    color: colors.primary,
    lineHeight: mscale(26),
  },
  featuredPill: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: wscale(12),
    paddingVertical: hscale(8),
    borderRadius: mscale(12),
    flexShrink: 1,
    marginLeft: wscale(14),
    maxWidth: wscale(140),
  },
  featuredPillText: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(9),
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: mscale(13),
  },
  storyCard: {
    backgroundColor: '#E5E5E5',
    borderRadius: mscale(32),
    padding: wscale(24),
    width: wscale(280),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  storyQuote: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(15),
    color: '#18181B',
    lineHeight: mscale(24),
    marginBottom: hscale(24),
  },
  storyUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyAvatar: {
    width: mscale(32),
    height: mscale(32),
    borderRadius: mscale(16),
    marginRight: wscale(10),
  },
  storyName: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(15),
    color: '#18181B',
  },
  storyUni: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(12),
    color: colors.primary,
    marginTop: 2,
  },

  // ── Active Gigs ───────────────────────────────────────────────
  activeGigsTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(15),
    color: '#18181B',
  },
  viewAll: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(13),
    color: colors.primary,
  },
  gigItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: mscale(16),
    flexDirection: 'row',
    alignItems: 'center',
    padding: wscale(14),
    borderWidth: 1,
    borderColor: '#EDE9F4',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 1 },
    }),
  },
  gigIconBox: {
    width: mscale(40),
    height: mscale(40),
    borderRadius: mscale(12),
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gigTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: mscale(13),
    color: '#18181B',
  },
  gigSub: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(11),
    color: '#71717A',
    marginTop: 2,
  },
  gigPrice: {
    fontFamily: 'Inter-Bold',
    fontSize: mscale(14),
    color: '#22C55E',
  },
  gigStatus: {
    fontFamily: 'Inter-Regular',
    fontSize: mscale(9),
    color: '#A1A1AA',
    marginTop: 2,
    letterSpacing: 0.4,
  },

  // ── Floating Actions ──────────────────────────────────────────
  kemiFab: {
    position: 'absolute',
    bottom: hscale(24),
    right: screenHorizontalPadding,
    width: mscale(64),
    height: mscale(64),
    borderRadius: mscale(32),
    backgroundColor: '#36175E', // Outer dark circle color
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#2b0c4a',
    ...Platform.select({
      ios: { shadowColor: '#36175E', shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
    }),
  },
  kemiFabPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: mscale(32),
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
