/** Pose names understood by the penguin art. */
export type MascotPose = 'idle' | 'greeting' | 'thinking' | 'celebrating' | 'encouraging'

/** The original owl API used these three moods; they keep working unchanged. */
export type LegacyMood = 'happy' | 'cheer' | 'think'

export type MascotMood = MascotPose | LegacyMood

export const MASCOT_POSES: readonly MascotPose[] = ['idle', 'greeting', 'thinking', 'celebrating', 'encouraging']

const LEGACY: Record<LegacyMood, MascotPose> = {
  happy: 'idle',
  cheer: 'celebrating',
  think: 'thinking',
}

/** Resolve any accepted mood to a pose. Unknown values fall back to idle. */
export function resolvePose(mood: MascotMood | undefined): MascotPose {
  if (!mood) return 'idle'
  if (mood in LEGACY) return LEGACY[mood as LegacyMood]
  return (MASCOT_POSES as readonly string[]).includes(mood) ? (mood as MascotPose) : 'idle'
}
