/**
 * Web Audio API synthesizer for kindergarten sound effects and calming melodies
 * Guarantees zero broken external audio URLs!
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.3;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Classic School Chime (Westminster Kin-Kon-Kan-Kon Bell)
  playSchoolBell(onComplete?: () => void) {
    if (!this.enabled) {
      if (onComplete) onComplete();
      return;
    }
    const ctx = this.getContext();
    if (!ctx) {
      if (onComplete) onComplete();
      return;
    }

    // Authentic Japanese anime school bell melody (F-A-G-C | F-G-A-F)
    // Kin (F4) - Kon (A4) - Kan (G4) - Kon (C4)
    // Kin (F4) - Kan (G4) - Kon (A4) - Kin (F4)
    const melody = [
      { freq: 349.23, delay: 0.00, duration: 0.9 }, // F4 (Kin)
      { freq: 440.00, delay: 0.65, duration: 0.9 }, // A4 (Kon)
      { freq: 392.00, delay: 1.30, duration: 0.9 }, // G4 (Kan)
      { freq: 261.63, delay: 1.95, duration: 1.4 }, // C4 (Kon - hold)
      // Small pause
      { freq: 349.23, delay: 2.85, duration: 0.9 }, // F4 (Kin)
      { freq: 392.00, delay: 3.50, duration: 0.9 }, // G4 (Kan)
      { freq: 440.00, delay: 4.15, duration: 0.9 }, // A4 (Kon)
      { freq: 349.23, delay: 4.80, duration: 2.0 }, // F4 (Kin - final hold)
    ];

    melody.forEach(({ freq, delay, duration }, index) => {
      setTimeout(() => {
        if (!ctx) return;
        const now = ctx.currentTime;

        // 1. Fundamental tone
        const osc1 = ctx.createOscillator();
        // 2. Metallic tubular chime harmonic (2.76x)
        const osc2 = ctx.createOscillator();
        // 3. High sparkle overtone (5.4x)
        const osc3 = ctx.createOscillator();

        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        const gain3 = ctx.createGain();
        const masterGain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq, now);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(freq * 2.76, now);

        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 5.40, now);

        // Warm tubular chime envelope with natural ring
        gain1.gain.setValueAtTime(0.40, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        gain2.gain.setValueAtTime(0.12, now);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.7));

        gain3.gain.setValueAtTime(0.04, now);
        gain3.gain.exponentialRampToValueAtTime(0.0001, now + (duration * 0.4));

        masterGain.gain.setValueAtTime(0.65, now);

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(masterGain);
        gain2.connect(masterGain);
        gain3.connect(masterGain);

        masterGain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        osc1.stop(now + duration + 0.1);
        osc2.stop(now + duration + 0.1);
        osc3.stop(now + duration + 0.1);

        if (index === melody.length - 1 && onComplete) {
          setTimeout(onComplete, (duration + 0.2) * 1000);
        }
      }, delay * 1000);
    });
  }

  // Quick 4-note chime for transitions or button clicks
  playQuickBell() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const quick = [
      { freq: 349.23, delay: 0.00, duration: 0.7 },
      { freq: 440.00, delay: 0.35, duration: 0.7 },
      { freq: 392.00, delay: 0.70, duration: 0.7 },
      { freq: 261.63, delay: 1.05, duration: 1.2 },
    ];

    quick.forEach(({ freq, delay, duration }) => {
      setTimeout(() => {
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.05);
      }, delay * 1000);
    });
  }

  // Sparkle / Magic chime
  playMagicChime() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const time = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.35);
    });
  }

  // Bubble pop
  playPop() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Cute boop / click (Silenced per user request for quiet UI)
  playBoop() {
    // Quiet UI - no button click boop
    return;
  }

  // Wheel tick
  playWheelTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // Soothing kindergarten lofi melody generator
  startMelody(theme: string = 'classroom', onNote?: (noteName: string) => void) {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    
    // Pentatonic scale notes in Hz (soft and soothing)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5
    const melodies: Record<string, number[]> = {
      classroom: [261.63, 329.63, 392.00, 523.25, 440.00, 392.00, 329.63, 293.66],
      lullaby: [329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63, 261.63],
      playful: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392.00],
      bell: [392.00, 440.00, 523.25, 659.25, 523.25, 440.00, 392.00, 329.63]
    };

    const notes = melodies[theme] || melodies.classroom;
    let step = 0;

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.enabled) return;
      const freq = notes[step % notes.length];
      step++;

      // Play chime note
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(this.musicVolume * 0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.75);

      if (onNote) onNote(`Note ${freq.toFixed(0)}Hz`);
    }, 600);
  }

  stopMelody() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  setVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
  }

  isPlaying() {
    return this.isMusicPlaying;
  }
}

export const soundManager = new SoundController();
