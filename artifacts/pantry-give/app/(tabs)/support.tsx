import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { usePantry } from '@/context/PantryContext';

const C = colors.light;

type Message = {
  id: string;
  text: string;
  role: 'bot' | 'user';
  time: string;
};

const initialMessages: Message[] = [
  { id: 'welcome', role: 'bot', text: 'Hi there! I’m your Pantry Give helper. How can I help today?', time: '2:47 PM' },
  { id: 'prompt', role: 'user', text: 'How do I add food to my pantry?', time: '2:48 PM' },
  { id: 'answer', role: 'bot', text: 'Tap Pantry below, then choose “+ Add item”. Add the food name and quantity, and I’ll keep it here for you.', time: '2:48 PM' },
];

function getBotReply(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('add') || normalized.includes('pantry') || normalized.includes('item')) {
    return 'Open Pantry and tap “+ Add item”. Enter the food name and quantity, then tap “Save to pantry”.';
  }
  if (normalized.includes('give') || normalized.includes('donat') || normalized.includes('share')) {
    return 'Open Give food, choose a nearby food bank marker, and tap “Post food to give”. Please share unopened, in-date food.';
  }
  if (normalized.includes('recipe') || normalized.includes('cook')) {
    return 'Recipes looks at what you already have. Try a search or tap an ingredient chip to find a good match.';
  }
  if (normalized.includes('point') || normalized.includes('reward')) {
    return 'You earn points by adding pantry items and sharing food. Check Profile to see your level and progress.';
  }
  if (normalized.includes('remove') || normalized.includes('delete')) {
    return 'Long press any pantry item to remove it. This keeps the list tidy when something is finished.';
  }
  return 'I can help with your pantry, recipes, food sharing, or points. Try asking “How do I share food?”';
}

function MessageBubble({ message }: { message: Message }) {
  const isBot = message.role === 'bot';
  return (
    <View style={[styles.messageRow, !isBot && styles.userRow]}>
      {isBot && <Image source={require('../../assets/images/mascot.png')} contentFit="contain" style={styles.messageMascot} />}
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.bubbleText, !isBot && styles.userBubbleText]}>{message.text}</Text>
        <Text style={[styles.messageTime, !isBot && styles.userTime]}>{message.time}</Text>
      </View>
    </View>
  );
}

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const { ingredients, donations } = usePantry();
  const listRef = useRef<FlatList<Message>>(null);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');

  const contextHint = useMemo(
    () => `${ingredients.length} pantry ${ingredients.length === 1 ? 'item' : 'items'} · ${donations.filter((item) => item.status === 'Available').length} active donation listings`,
    [donations, ingredients],
  );

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', text, time };
    const reply: Message = { id: `${Date.now()}-bot`, role: 'bot', text: getBotReply(text), time };
    setMessages((current) => [...current, userMessage, reply]);
    setDraft('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderMessage = ({ item }: ListRenderItemInfo<Message>) => <MessageBubble message={item} />;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior="padding">
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <View style={styles.headerTitleRow}>
          <Image source={require('../../assets/images/mascot.png')} contentFit="contain" style={styles.headerMascot} />
          <View>
            <Text style={styles.eyebrow}>PANTRY GIVE</Text>
            <Text style={styles.title}>Chat-Bot Support</Text>
          </View>
        </View>
        <View style={styles.statusPill}><View style={styles.statusDot} /><Text style={styles.statusText}>24/7</Text></View>
      </View>

      <View style={styles.contextStrip}>
        <Feather name="star" size={14} color={C.primary} />
        <Text style={styles.contextText}>Here to help with your food journey · {contextHint}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
      />

      <View style={[styles.composerWrap, { paddingBottom: Math.max(insets.bottom + 68, 76) }]}>
        <View style={styles.composer}>
          <TextInput
            testID="support-input"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            placeholder="Type your message..."
            placeholderTextColor={C.mutedForeground}
            style={styles.input}
            returnKeyType="send"
            multiline
            maxLength={240}
          />
          <Pressable
            testID="support-send"
            accessibilityLabel="Send message"
            onPress={sendMessage}
            disabled={!draft.trim()}
            style={({ pressed }) => [styles.sendButton, !draft.trim() && styles.sendDisabled, pressed && styles.pressed]}
          >
            <Feather name="arrow-up" size={19} color={C.primaryForeground} />
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>Pantry Give support is available whenever you need it.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.background },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerMascot: { height: 40, width: 40 },
  eyebrow: { color: C.mutedForeground, fontSize: 9, fontWeight: '700', letterSpacing: 1.3 },
  title: { color: C.foreground, fontSize: 20, fontWeight: '700', marginTop: 2 },
  statusPill: { backgroundColor: C.secondary, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { height: 6, width: 6, borderRadius: 3, backgroundColor: C.primary },
  statusText: { color: C.primary, fontSize: 10, fontWeight: '700' },
  contextStrip: { marginHorizontal: 20, backgroundColor: C.card, borderRadius: 12, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 7 },
  contextText: { color: C.mutedForeground, fontSize: 10, flex: 1 },
  messages: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 18, gap: 16 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '91%' },
  userRow: { alignSelf: 'flex-end' },
  messageMascot: { height: 34, width: 34, marginBottom: 16 },
  bubble: { paddingHorizontal: 13, paddingTop: 11, paddingBottom: 8, borderRadius: 16, maxWidth: '88%' },
  botBubble: { backgroundColor: C.card, borderBottomLeftRadius: 4 },
  userBubble: { backgroundColor: C.secondary, borderBottomRightRadius: 4 },
  bubbleText: { color: C.foreground, fontSize: 13, lineHeight: 19 },
  userBubbleText: { color: C.foreground },
  messageTime: { color: C.mutedForeground, fontSize: 9, marginTop: 6, textAlign: 'right' },
  userTime: { color: C.primary, opacity: 0.75 },
  composerWrap: { paddingHorizontal: 18, paddingTop: 10, backgroundColor: C.background },
  composer: { backgroundColor: C.card, borderRadius: 18, padding: 7, paddingLeft: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border },
  input: { color: C.foreground, fontSize: 13, lineHeight: 18, flex: 1, maxHeight: 72, paddingVertical: 6 },
  sendButton: { backgroundColor: C.primary, height: 38, width: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendDisabled: { opacity: 0.4 },
  pressed: { transform: [{ scale: 0.94 }] },
  disclaimer: { color: C.mutedForeground, fontSize: 9, textAlign: 'center', paddingTop: 7 },
});