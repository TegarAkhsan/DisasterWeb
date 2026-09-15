// Web Audio API Procedural Sound Engine
// Ensures 100% reliable sound effects with zero external audio dependencies

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentSiren: { osc1: OscillatorNode; osc2: OscillatorNode; interval: number } | null = null;
  private ambientNoiseNode: AudioNode | null = null;

  constructor() {
    // Lazy init AudioContext on first user interaction to comply with browser autoplay policy
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
    if (muted) {
      this.stopSiren();
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  // UI Sound: Futuristic Click
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext unavailable
    }
  }

  // UI Sound: Hover blip
  public playHover() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // Quiz: Correct Answer Chime
  public playCorrect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.3);
      });
    } catch {}
  }

  // Quiz: Wrong Answer Buzz
  public playWrong() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  // Disaster Sound: Low Earthquake Rumble (Synthesized Brownian Noise & Sub-bass)
  public playEarthquakeRumble(durationSeconds: number = 4) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      // Sub-bass oscillator
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(45, this.ctx.currentTime);
      subOsc.frequency.linearRampToValueAtTime(32, this.ctx.currentTime + durationSeconds);

      subGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.5);
      subGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + durationSeconds);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start();
      subOsc.stop(this.ctx.currentTime + durationSeconds);

      // Lowpass filtered noise for rocks crumbling
      const bufferSize = this.ctx.sampleRate * durationSeconds;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + durationSeconds);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start();
    } catch {}
  }

  // Disaster Sound: Emergency Warning Siren
  public startSiren() {
    if (this.isMuted || this.currentSiren) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      // Modulate frequency like emergency siren
      let high = true;
      const interval = window.setInterval(() => {
        if (!this.ctx) return;
        osc.frequency.cancelScheduledValues(this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(high ? 850 : 500, this.ctx.currentTime + 0.6);
        high = !high;
      }, 650);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start();

      this.currentSiren = { osc1: osc, osc2: osc, interval };
    } catch {}
  }

  public stopSiren() {
    if (this.currentSiren) {
      clearInterval(this.currentSiren.interval);
      try {
        this.currentSiren.osc1.stop();
        this.currentSiren.osc1.disconnect();
      } catch {}
      this.currentSiren = null;
    }
  }

  // Disaster Sound: Eruption Boom / Explosion
  public playVolcanoExplosion() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.6));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 2.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.2);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch {}
  }

  // Disaster Sound: Tornado Whirlwind / High Wind Roar
  public playTornadoWind(durationSeconds: number = 3) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const bufferSize = this.ctx.sampleRate * durationSeconds;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(400, this.ctx.currentTime);
      bandpass.Q.setValueAtTime(3.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 1);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + durationSeconds);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
    } catch {}
  }

  // Tsunami Water Surge
  public playTsunamiSurge() {
    this.playTornadoWind(4.5);
  }

  // Text-To-Speech Narration in Indonesian
  public speakIndonesian(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // cancel any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    // Attempt to select an Indonesian voice if available
    const voices = window.speechSynthesis.getVoices();
    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID'));
    if (idVoice) {
      utterance.voice = idVoice;
    }
    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const soundEngine = new SoundEngine();
