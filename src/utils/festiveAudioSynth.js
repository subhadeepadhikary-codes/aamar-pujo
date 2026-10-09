// Web Audio API Synthesizer for Authentic Bengali Dhak, Shankha & Kanshor
// Provides zero-latency, 100% offline-ready festive sounds

class FestiveAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.tempo = 110;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playDhakBeat(time) {
    if (!this.ctx) return;
    // Low drum resonance (Ghudum)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.18);

    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.25);

    // High snare slap (Dhaang)
    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1800;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, time + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    whiteNoise.start(time + 0.05);
  }

  playKanshor(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(2400, time);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + 0.38);
  }

  startDhakLoop() {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    let step = 0;
    const intervalMs = (60 / this.tempo / 4) * 1000;

    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Traditional 4-beat Dhak groove
      if (step % 16 === 0 || step % 16 === 6 || step % 16 === 10) {
        this.playDhakBeat(now);
      }
      if (step % 8 === 4) {
        this.playKanshor(now);
      }
      step = (step + 1) % 16;
    }, intervalMs);
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const festiveSynth = new FestiveAudioSynth();
