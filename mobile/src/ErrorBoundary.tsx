import { Component, type ErrorInfo, type ReactNode } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { c } from './ui';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Never log submitted messages, links, screenshots, family names, or saved state.
    console.error('SHOMAR render failure', { name: error.name, componentStackAvailable: Boolean(info.componentStack) });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <SafeAreaView style={styles.safe}><View style={styles.card} accessibilityRole="alert"><Text style={styles.title}>SHOMAR needs to restart</Text><Text style={styles.body}>Close and reopen the app. Your saved safety plan should remain on this phone. If this keeps happening, record the steps you took without including a private message, link, screenshot, or family name.</Text></View></SafeAreaView>;
  }
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: c.navy, justifyContent: 'center', padding: 24 }, card: { padding: 24, borderRadius: 20, backgroundColor: c.white, gap: 14 }, title: { color: c.navy, fontSize: 24, lineHeight: 31, fontWeight: '800' }, body: { color: c.ink, fontSize: 16, lineHeight: 24 } });
