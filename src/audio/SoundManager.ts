/**
 * Procedural Web Audio Sound Engine for ECHOBOUND.
 * Provides atmospheric dynamic ambience and responsive combat/timeline SFX.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambience nodes
  private presentDrone: OscillatorNode | null = null;
  private presentFilter: BiquadFilterNode | null = null;
  private echoPad1: OscillatorNode | null = null;
  private echoPad2: OscillatorNode | null = null;
  private echoGain: GainNode | null = null;
  private presentGainNode: GainNode | null = null;
  private isAmbienceRunning: boolean = false;

  private currentTimeline: 'PRESENT' | 'ECHO' = 'PRESENT';

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.startAmbience();
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  public setMasterVolume(val: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
  }

  public setSFXVolume(val: number) {
    if (!this.sfxGain || !this.ctx) return;
    this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
  }

  public setMusicVolume(val: number) {
    if (!this.ambientGain || !this.ctx) return;
    this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, val)), this.ctx.currentTime);
  }

  private startAmbience() {
    if (!this.ctx || !this.ambientGain || this.isAmbienceRunning) return;

    // PRESENT ambience: deep rumbling sub-bass and filtered wind
    this.presentGainNode = this.ctx.createGain();
    this.presentGainNode.gain.setValueAtTime(this.currentTimeline === 'PRESENT' ? 0.35 : 0.0, this.ctx.currentTime);
    this.presentGainNode.connect(this.ambientGain);

    this.presentDrone = this.ctx.createOscillator();
    this.presentDrone.type = 'sawtooth';
    this.presentDrone.frequency.setValueAtTime(48, this.ctx.currentTime); // Low deep G

    this.presentFilter = this.ctx.createBiquadFilter();
    this.presentFilter.type = 'lowpass';
    this.presentFilter.frequency.setValueAtTime(160, this.ctx.currentTime);

    this.presentDrone.connect(this.presentFilter);
    this.presentFilter.connect(this.presentGainNode);
    this.presentDrone.start();

    // ECHO ambience: radiant warm harmonic chords (celestial pad)
    this.echoGain = this.ctx.createGain();
    this.echoGain.gain.setValueAtTime(this.currentTimeline === 'ECHO' ? 0.35 : 0.0, this.ctx.currentTime);
    this.echoGain.connect(this.ambientGain);

    this.echoPad1 = this.ctx.createOscillator();
    this.echoPad1.type = 'sine';
    this.echoPad1.frequency.setValueAtTime(220, this.ctx.currentTime); // A3

    this.echoPad2 = this.ctx.createOscillator();
    this.echoPad2.type = 'triangle';
    this.echoPad2.frequency.setValueAtTime(330, this.ctx.currentTime); // E4 (warm fifth)

    const echoFilter = this.ctx.createBiquadFilter();
    echoFilter.type = 'lowpass';
    echoFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.echoPad1.connect(echoFilter);
    this.echoPad2.connect(echoFilter);
    echoFilter.connect(this.echoGain);

    this.echoPad1.start();
    this.echoPad2.start();

    this.isAmbienceRunning = true;
  }

  public switchTimeline(timeline: 'PRESENT' | 'ECHO') {
    this.currentTimeline = timeline;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = 0.8;

    if (this.presentGainNode && this.echoGain) {
      if (timeline === 'PRESENT') {
        this.presentGainNode.gain.cancelScheduledValues(now);
        this.presentGainNode.gain.setValueAtTime(this.presentGainNode.gain.value, now);
        this.presentGainNode.gain.linearRampToValueAtTime(0.35, now + duration);

        this.echoGain.gain.cancelScheduledValues(now);
        this.echoGain.gain.setValueAtTime(this.echoGain.gain.value, now);
        this.echoGain.gain.linearRampToValueAtTime(0.0, now + duration);
      } else {
        this.presentGainNode.gain.cancelScheduledValues(now);
        this.presentGainNode.gain.setValueAtTime(this.presentGainNode.gain.value, now);
        this.presentGainNode.gain.linearRampToValueAtTime(0.0, now + duration);

        this.echoGain.gain.cancelScheduledValues(now);
        this.echoGain.gain.setValueAtTime(this.echoGain.gain.value, now);
        this.echoGain.gain.linearRampToValueAtTime(0.35, now + duration);
      }
    }

    this.playEchoShiftSound();
  }

  public playEchoShiftSound() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub drop pulse
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
    subGain.gain.setValueAtTime(0.8, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.6);

    // Harmonic crystalline chime
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chimeOsc.type = 'triangle';
    chimeOsc.frequency.setValueAtTime(520, now);
    chimeOsc.frequency.linearRampToValueAtTime(1040, now + 0.3);
    chimeGain.gain.setValueAtTime(0.4, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chimeOsc.start(now);
    chimeOsc.stop(now + 0.75);

    // Noise swoosh
    this.playNoiseBurst(0.35, 0.4, 400, 1200);
  }

  public playSwordSwing(heavy: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const startFreq = heavy ? 300 : 450;
    const endFreq = heavy ? 80 : 120;
    const dur = heavy ? 0.28 : 0.16;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(heavy ? 600 : 1000, now);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + dur);

    this.playNoiseBurst(dur, heavy ? 0.35 : 0.2, 300, 1800);
  }

  public playHitImpact(isHeavy: boolean = false) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Heavy bass thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(isHeavy ? 90 : 130, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);

    // Crunch noise
    this.playNoiseBurst(0.12, 0.5, 200, 2400);
  }

  public playParryClash() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // High metal ringing
    [1200, 1850, 2400].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.3 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + idx * 0.2);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  public playDodge() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.2);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playAbilitySound(ability: 'echoStrike' | 'timeBreak' | 'realitySlash') {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    if (ability === 'echoStrike') {
      // Warp dash + explosive blade impact
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.4);
      this.playNoiseBurst(0.25, 0.4, 300, 2000);
    } else if (ability === 'timeBreak') {
      // Harmonic time freeze sound
      [440, 554.37, 659.25, 880].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now);
        osc.stop(now + 1.3);
      });
    } else if (ability === 'realitySlash') {
      // Wave slash sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(860, now + 0.4);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  }

  public playShardPickup() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.6);
    });
  }

  public playPuzzleSolve() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [261.63, 329.63, 392.00, 523.25].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.3, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.9);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.0);
    });
  }

  public playEchoAnchor() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Spatial magnetic lock tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.45);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.55);
    this.playNoiseBurst(0.2, 0.25, 800, 3200);
  }

  public playEchoVision(active: boolean) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    if (active) {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.3);
    } else {
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);
    }
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  public playRealityBreak() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Sub-bass rupture
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(120, now);
    sub.frequency.exponentialRampToValueAtTime(25, now + 0.7);
    subGain.gain.setValueAtTime(0.7, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now);
    sub.stop(now + 0.8);

    // Dimensional glass shatter
    [880, 1174, 1480, 1760].forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + idx * 0.04);
      g.gain.setValueAtTime(0.25, now + idx * 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
      osc.connect(g);
      g.connect(this.sfxGain!);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.7);
    });
  }

  public playEchoFinisher() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // Slow-mo heavy cinematic execution slash
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.7);
    this.playNoiseBurst(0.4, 0.6, 120, 2400);
  }

  public playSecretDiscovered() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [329.63, 440.0, 523.25, 659.25, 880.0].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0.28, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  }

  public playQuestComplete() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.7].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.32, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.1);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 1.2);
    });
  }

  private playNoiseBurst(duration: number, volume: number, lowFreq: number, highFreq: number) {
    if (!this.ctx || !this.sfxGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((lowFreq + highFreq) / 2, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }
}

export const soundManager = new SoundManager();
