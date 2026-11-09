import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform, Linking, Alert, ActivityIndicator } from 'react-native';
import { theme as c } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

type College = { name: string; type: string; location: string; note: string; tag: string; url: string; majors: string[] };
// Real institutions, with links to official sites. Major categories are exploratory,
// not verified program availability or admissions criteria.
const colleges: College[] = [
  { name: 'Pennsylvania State University', type: 'Public university', location: 'University Park, PA', note: 'Explore programs and current admissions requirements on the official website.', tag: 'Public', url: 'https://www.psu.edu/', majors: ['Engineering','Business','Science','Arts'] },
  { name: 'Temple University', type: 'Public university', location: 'Philadelphia, PA', note: 'Explore programs and current admissions requirements on the official website.', tag: 'Public', url: 'https://www.temple.edu/', majors: ['Business','Health','Arts','Science'] },
  { name: 'University of Pittsburgh', type: 'Public university', location: 'Pittsburgh, PA', note: 'Explore programs and current admissions requirements on the official website.', tag: 'Public', url: 'https://www.pitt.edu/', majors: ['Health','Engineering','Science','Arts'] },
  { name: 'Drexel University', type: 'Private university', location: 'Philadelphia, PA', note: 'Explore programs and current admissions requirements on the official website.', tag: 'Private', url: 'https://drexel.edu/', majors: ['Engineering','Business','Health','Arts'] },
  { name: 'Wilkes University', type: 'Private university', location: 'Wilkes-Barre, PA', note: 'Explore programs and current admissions requirements on the official website.', tag: 'Private', url: 'https://www.wilkes.edu/', majors: ['Business','Health','Science','Arts'] },
  { name: 'Luzerne County Community College', type: 'Community college', location: 'Nanticoke, PA', note: 'Explore transfer pathways and current program offerings on the official website.', tag: 'Community', url: 'https://www.luzerne.edu/', majors: ['Business','Health','Science','Arts'] },
];
const majorOptions = ['Undecided','Engineering','Business','Health','Science','Arts'];
const STORAGE_KEY = 'major-mapping-profile-v2';
const tabs = ['Home', 'Explore', 'My Profile', 'My Matches'] as const;
type Tab = typeof tabs[number];

function Pill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' }) {
  const bg = tone === 'green' ? '#E8F5EE' : tone === 'amber' ? '#FFF3DF' : c.paleBlue;
  const fg = tone === 'green' ? c.green : tone === 'amber' ? c.amber : c.blue;
  return <View style={[s.pill, { backgroundColor: bg }]}><Text style={{ color: fg, fontSize: 12, fontWeight: '700' }}>{children}</Text></View>;
}
function Card({ children }: { children: React.ReactNode }) { return <View style={s.card}>{children}</View>; }
function Label({ children }: { children: React.ReactNode }) { return <Text style={s.label}>{children}</Text>; }

export default function HomeScreen() {
  const [tab, setTab] = useState<Tab>('Home');
  const [search, setSearch] = useState('');
  const [gpa, setGpa] = useState('');
  const [sat, setSat] = useState('');
  const [activities, setActivities] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [major, setMajor] = useState('Undecided');
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState('');
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (!active || !raw) return;
      const data = JSON.parse(raw);
      if (typeof data.gpa === 'string') setGpa(data.gpa);
      if (typeof data.sat === 'string') setSat(data.sat);
      if (typeof data.activities === 'string') setActivities(data.activities);
      if (majorOptions.includes(data.major)) setMajor(data.major);
      if (Array.isArray(data.saved)) setSaved(data.saved.filter((x: unknown) => typeof x === 'string'));
    }).catch(() => { if (active) setStorageError('Could not load saved information.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ gpa, sat, activities, major, saved }))
      .then(() => setStorageError(''))
      .catch(() => setStorageError('Unable to save changes on this device.'));
  }, [gpa, sat, activities, major, saved, loading]);
  const openCollege = async (college: College) => {
    try { await Linking.openURL(college.url); }
    catch { Alert.alert('Unable to open website', 'Please try again when you have an internet connection.'); }
  };
  const matches = useMemo(() => colleges.filter(x => saved.includes(x.name)).sort((a,b) => Number(b.majors.includes(major)) - Number(a.majors.includes(major))), [saved, major]);
  const filtered = useMemo(() => colleges.filter(x => `${x.name} ${x.type} ${x.tag} ${x.location} ${x.majors.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const profileStarted = !!(gpa || sat || activities);

  const title = tab === 'Home' ? 'Your college journey, mapped.' : tab === 'Explore' ? 'Explore colleges' : tab === 'My Profile' ? 'Your student profile' : 'Your college matches';
  const subtitle = tab === 'Home' ? 'A clearer path from where you are to where you want to go.' : tab === 'Explore' ? 'Discover schools and understand what they look for.' : tab === 'My Profile' ? 'Add your information to personalize your college research.' : 'Understand how your profile compares with published expectations.';

  return <SafeAreaView style={s.safe}>
    <View style={s.topbar}><View style={s.brandLockup}><View style={s.crest}><Text style={s.crestText}>M</Text></View><View><Text style={s.brand}>MAJOR <Text style={{ color: c.blue }}>MAPPING</Text></Text><Text style={s.brandSub}>A MORE THOUGHTFUL PATH TO COLLEGE</Text></View></View><View style={s.avatar}><Text style={s.avatarText}>MM</Text></View></View>
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.hero}><Text style={s.heroKicker}>THE ART OF A WELL-PLANNED FUTURE</Text><View style={s.heroRule} /><Text style={s.heroTitle}>{title}</Text><Text style={s.heroSub}>{subtitle}</Text></View>

      {loading && <ActivityIndicator color={c.navy} />}
      {!!storageError && <Text style={s.smallNote}>{storageError}</Text>}
      {tab === 'Home' && <>
        <Card><Text style={s.cardEyebrow}>GETTING STARTED</Text><Text style={s.cardTitle}>Build your admissions profile</Text><Text style={s.body}>Add your grades, test scores, courses, activities, and interests. Major Mapping can then help you identify areas to strengthen.</Text><Pressable style={s.primaryBtn} onPress={() => setTab('My Profile')}><Text style={s.primaryText}>Build my profile  →</Text></Pressable></Card>
        <Text style={s.sectionTitle}>Your planning tools</Text>
        <View style={s.grid}><Pressable style={s.toolCard} onPress={() => setTab('Explore')}><Text style={s.toolIcon}>⌕</Text><Text style={s.toolTitle}>College Explorer</Text><Text style={s.toolSub}>Search schools and requirements</Text></Pressable><Pressable style={s.toolCard} onPress={() => setTab('My Matches')}><Text style={s.toolIcon}>◎</Text><Text style={s.toolTitle}>My Matches</Text><Text style={s.toolSub}>Review your profile alignment</Text></Pressable></View>
        <Card><Text style={s.cardTitle}>How Major Mapping works</Text><View style={s.step}><Text style={s.stepNum}>01</Text><View style={{ flex: 1 }}><Text style={s.stepTitle}>Enter your profile</Text><Text style={s.body}>Share academic and extracurricular information.</Text></View></View><View style={s.step}><Text style={s.stepNum}>02</Text><View style={{ flex: 1 }}><Text style={s.stepTitle}>Explore college expectations</Text><Text style={s.body}>Review official requirements and admitted-student data.</Text></View></View><View style={s.step}><Text style={s.stepNum}>03</Text><View style={{ flex: 1 }}><Text style={s.stepTitle}>Make a plan</Text><Text style={s.body}>Set realistic goals and build a balanced college list.</Text></View></View></Card>
      </>}

      {tab === 'Explore' && <>
        <TextInput value={search} onChangeText={setSearch} placeholder="Search colleges or college types" placeholderTextColor={c.muted} style={s.search} />
        <View style={s.notice}><Text style={s.noticeTitle}>Early prototype</Text><Text style={s.noticeText}>These are real colleges, but program tags are only broad exploration aids. Check each official website for current majors, costs, deadlines and admissions requirements.</Text></View>
        {filtered.map((college) => <Card key={college.name}><View style={s.rowBetween}><Pill>{college.tag}</Pill><Pressable onPress={() => setSaved(v => v.includes(college.name) ? v.filter(n => n !== college.name) : [...v, college.name])}><Text style={s.save}>{saved.includes(college.name) ? '♥ Saved' : '♡ Save'}</Text></Pressable></View><Text style={s.cardTitle}>{college.name}</Text><Text style={s.body}>{college.type} · {college.location}</Text><Text style={s.smallNote}>{college.note}</Text><Pressable accessibilityRole="link" onPress={() => openCollege(college)}><Text style={s.linkText}>Visit official college website →</Text></Pressable></Card>)}
        {filtered.length === 0 && <Card><Text style={s.body}>No colleges match that search. Try another term.</Text></Card>}
      </>}

      {tab === 'My Profile' && <>
        <Card><Text style={s.cardTitle}>Academic information</Text><Text style={s.body}>Enter what you know. You can update it as your grades and test scores change.</Text><Label>Area of interest</Label><View style={s.chipRow}>{majorOptions.map(m => <Pressable key={m} accessibilityRole="button" onPress={() => setMajor(m)} style={[s.chip, major === m && s.chipActive]}><Text style={[s.chipText, major === m && s.chipTextActive]}>{m}</Text></Pressable>)}</View><Label>GPA (include scale, e.g. 3.7/4.0)</Label><TextInput value={gpa} onChangeText={setGpa} placeholder="e.g. 3.7 / 4.0" keyboardType="decimal-pad" style={s.input} /><Label>SAT score (optional)</Label><TextInput value={sat} onChangeText={setSat} placeholder="e.g. 1250" keyboardType="number-pad" style={s.input} /><Label>Activities, leadership, awards, and interests</Label><TextInput value={activities} onChangeText={setActivities} placeholder="Add clubs, sports, jobs, volunteering..." multiline style={[s.input, s.multiline]} /><Text style={s.smallNote}>Saved locally on this device. No account or cloud upload. Do not enter sensitive personal information.</Text><Pressable style={s.primaryBtn} onPress={() => setTab('My Matches')}><Text style={s.primaryText}>Review my profile →</Text></Pressable></Card>
      </>}

      {tab === 'My Matches' && <>
        <Card><Pill tone={profileStarted ? 'green' : 'amber'}>{profileStarted ? 'PROFILE STARTED' : 'PROFILE NEEDED'}</Pill><Text style={s.cardTitle}>Your admissions overview</Text><Text style={s.body}>{profileStarted ? 'Your profile is saved on this device. Explore colleges, save schools you like, and review them below. Major interests are not admission predictions.' : 'Start your profile, then save colleges from Explore to create a shortlist.'}</Text><Pressable style={s.primaryBtn} onPress={() => setTab('My Profile')}><Text style={s.primaryText}>{profileStarted ? 'Update my profile' : 'Add my information'}  →</Text></Pressable></Card>
        <Card><Text style={s.cardTitle}>Your saved college shortlist ({matches.length})</Text><Text style={s.body}>Sorted by broad area of interest ({major}). This is an exploration tool, not an admission probability or a verified list of majors.</Text>
          {matches.length === 0 ? <><Text style={s.body}>No schools saved yet.</Text><Pressable style={s.primaryBtn} onPress={() => setTab('Explore')}><Text style={s.primaryText}>Explore colleges →</Text></Pressable></> : matches.map(college => <View key={college.name} style={s.matchEntry}><Text style={s.stepTitle}>{college.name}</Text><Text style={s.smallNote}>{college.location}{major !== 'Undecided' && college.majors.includes(major) ? ' · Related interest category' : ''}</Text><View style={s.rowBetween}><Pressable onPress={() => openCollege(college)}><Text style={s.linkText}>Official website →</Text></Pressable><Pressable onPress={() => setSaved(v => v.filter(n => n !== college.name))}><Text style={s.save}>Remove</Text></Pressable></View></View>)}
        </Card>
        <View style={s.notice}><Text style={s.noticeTitle}>A note about admissions estimates</Text><Text style={s.noticeText}>No tool can know an individual student's admission outcome. Major Mapping will show evidence-based competitiveness bands and explain the data behind them, rather than guarantee acceptance or invent precise odds.</Text></View>
      </>}
      <Text style={s.footer}>MAJOR MAPPING · LOCAL-FIRST BETA · 2026</Text>
    </ScrollView>
    <View style={s.nav}>{tabs.map(t => <Pressable key={t} onPress={() => setTab(t)} style={s.navItem}><Text style={[s.navIcon, tab === t && s.navActive]}>{t === 'Home' ? '⌂' : t === 'Explore' ? '⌕' : t === 'My Profile' ? '◉' : '◎'}</Text><Text style={[s.navText, tab === t && s.navTextActive]}>{t}</Text></Pressable>)}</View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background, paddingTop: Platform.OS === 'android' ? 24 : 0 },
  topbar: { minHeight: 78, backgroundColor: c.background, borderBottomWidth: 1, borderBottomColor: c.border, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 11 }, crest: { width: 38, height: 42, borderWidth: 1, borderColor: c.blue, alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 12, borderBottomRightRadius: 12 }, crestText: { color: c.navy, fontSize: 22, fontFamily: 'Georgia', fontWeight: '700' },
  brand: { color: c.navy, fontSize: 16, fontWeight: '900', letterSpacing: 1.5 }, brandSub: { color: c.muted, fontSize: 8, letterSpacing: 1.2, marginTop: 4, fontWeight: '700' }, avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.paleBlue, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: c.navy, fontWeight: '800', fontSize: 11 },
  content: { padding: 22, paddingBottom: 38, maxWidth: 760, width: '100%', alignSelf: 'center', gap: 17 }, hero: { paddingTop: 17, paddingBottom: 12, gap: 10 }, heroKicker: { color: c.blue, fontWeight: '800', fontSize: 9, letterSpacing: 2.1 }, heroRule: { width: 42, height: 2, backgroundColor: c.blue, marginTop: 1 }, heroTitle: { color: c.navy, fontWeight: '700', fontFamily: 'Georgia', fontSize: 32, lineHeight: 39, letterSpacing: -0.6 }, heroSub: { color: c.muted, fontSize: 14, lineHeight: 22, maxWidth: 560 }, pill: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6 },
  card: { backgroundColor: c.white, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 19, gap: 12, shadowColor: '#4B4638', shadowOpacity: 0.035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 1 }, cardEyebrow: { color: c.blue, fontWeight: '800', fontSize: 9, letterSpacing: 1.8 }, cardTitle: { color: c.ink, fontWeight: '700', fontFamily: 'Georgia', fontSize: 19, lineHeight: 26 }, body: { color: c.muted, fontSize: 13, lineHeight: 21 }, primaryBtn: { backgroundColor: c.navy, paddingVertical: 14, paddingHorizontal: 17, borderRadius: 5, alignItems: 'center', marginTop: 5 }, primaryText: { color: c.white, fontWeight: '700', fontSize: 13, letterSpacing: 0.3 }, sectionTitle: { color: c.navy, fontWeight: '700', fontFamily: 'Georgia', fontSize: 20, marginTop: 3 }, grid: { flexDirection: 'row', gap: 11 }, toolCard: { flex: 1, backgroundColor: c.white, borderWidth: 1, borderColor: c.border, borderRadius: 8, padding: 15, gap: 7 }, toolIcon: { color: c.blue, fontSize: 25 }, toolTitle: { color: c.ink, fontWeight: '700', fontFamily: 'Georgia', fontSize: 15 }, toolSub: { color: c.muted, fontSize: 11, lineHeight: 17 }, step: { flexDirection: 'row', gap: 13, paddingTop: 6 }, stepNum: { color: c.blue, fontWeight: '800', fontSize: 12, paddingTop: 2, letterSpacing: 1 }, stepTitle: { color: c.ink, fontWeight: '700', fontSize: 13, marginBottom: 3 },
  search: { backgroundColor: c.white, borderWidth: 1, borderColor: c.border, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 14, color: c.ink, fontSize: 13 }, notice: { backgroundColor: '#F1EBDD', borderColor: '#E4D8BF', borderWidth: 1, borderRadius: 6, padding: 14, gap: 5 }, noticeTitle: { color: c.amber, fontWeight: '800', fontSize: 12, letterSpacing: 0.2 }, noticeText: { color: '#766344', fontSize: 11, lineHeight: 18 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, save: { color: c.navy, fontWeight: '700', fontSize: 12 }, smallNote: { color: c.muted, fontSize: 10, lineHeight: 17 }, linkText: { color: c.navy, fontSize: 12, fontWeight: '800', marginTop: 3 }, label: { color: c.ink, fontWeight: '700', fontSize: 11, marginTop: 5 }, input: { borderWidth: 1, borderColor: c.border, borderRadius: 5, padding: 13, fontSize: 13, color: c.ink, backgroundColor: '#FFFDF8' }, multiline: { minHeight: 100, textAlignVertical: 'top' }, matchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.border }, matchLabel: { color: c.ink, fontSize: 12, fontWeight: '600' }, footer: { textAlign: 'center', color: '#9A9689', fontSize: 8, letterSpacing: 1.7, paddingVertical: 15 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderWidth: 1, borderColor: c.border, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 12 }, chipActive: { backgroundColor: c.navy, borderColor: c.navy }, chipText: { color: c.ink, fontSize: 12 }, chipTextActive: { color: c.white }, matchEntry: { borderTopWidth: 1, borderTopColor: c.border, paddingTop: 12, gap: 7 },
  nav: { backgroundColor: c.white, borderTopWidth: 1, borderTopColor: c.border, minHeight: 66, paddingBottom: Platform.OS === 'ios' ? 12 : 4, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' }, navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 8 }, navIcon: { color: '#9A9B91', fontSize: 19 }, navActive: { color: c.navy }, navText: { color: c.muted, fontSize: 9, fontWeight: '600' }, navTextActive: { color: c.navy, fontWeight: '800' }
});
