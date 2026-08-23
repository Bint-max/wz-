"use client";

/**
 * 全局悬浮音乐播放器（网易云风格 / 卡哇伊版）
 * - 底部悬浮，支持展开/收起，PC / 移动端自适应
 * - 播放 / 暂停 / 上一首 / 下一首 / 音量 / 进度
 * - 顺序 / 单曲循环 / 随机播放
 * - 封面旋转、加载与异常提示、播放列表持久化
 * - LRC 歌词显示、滚动与高亮
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  ChevronDown,
  ChevronUp,
  Music2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MusicItem } from "@/types";
import {
  formatTime,
  parseLrc,
  loadMusicPersist,
  saveMusicPersist,
  loadVolume,
  saveVolume,
  MUSIC_SCENE_EVENT,
  type PlayMode,
  type LyricLine,
} from "@/lib/music";

const MODE_ICON = {
  order: ListMusic,
  single: Repeat,
  shuffle: Shuffle,
} as const;

const MODE_LABEL = {
  order: "顺序播放",
  single: "单曲循环",
  shuffle: "随机播放",
} as const;

function nextIndex(list: MusicItem[], current: number, mode: PlayMode): number {
  if (list.length === 0) return 0;
  if (mode === "single") return current;
  if (mode === "shuffle") {
    if (list.length === 1) return 0;
    let n = current;
    while (n === current) n = Math.floor(Math.random() * list.length);
    return n;
  }
  return (current + 1) % list.length;
}

function prevIndex(list: MusicItem[], current: number, mode: PlayMode): number {
  if (list.length === 0) return 0;
  if (mode === "shuffle") {
    if (list.length === 1) return 0;
    let n = current;
    while (n === current) n = Math.floor(Math.random() * list.length);
    return n;
  }
  return (current - 1 + list.length) % list.length;
}

export function MusicPlayer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricBoxRef = useRef<HTMLDivElement | null>(null);

  const [playlist, setPlaylist] = useState<MusicItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [mode, setMode] = useState<PlayMode>("order");
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);

  const playlistRef = useRef(playlist);
  const currentIndexRef = useRef(currentIndex);
  const modeRef = useRef(mode);
  const volumeRef = useRef(volume);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  const fetchLyric = useCallback((url: string) => {
    setLyrics([]);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("lyric load failed");
        return r.text();
      })
      .then((text) => setLyrics(parseLrc(text)))
      .catch(() => setLyrics([]));
  }, []);

  const prepareTrack = useCallback(
    (list: MusicItem[], index: number, autoplay: boolean) => {
      const track = list[index];
      if (!track) return;
      currentIndexRef.current = index;
      setCurrentIndex(index);
      setError(null);
      setCurrentTime(0);
      setDuration(0);
      setLyrics([]);
      if (track.lyric) fetchLyric(track.lyric);

      const audio = audioRef.current;
      if (!audio) return;
      audio.src = track.url;
      audio.volume = volumeRef.current;
      audio.load();
      if (autoplay) {
        setLoading(true);
        audio.play().catch(() => {
          setIsPlaying(false);
          setLoading(false);
          setError("播放失败，请重试（浏览器可能阻止了自动播放）");
        });
      }
    },
    [fetchLyric],
  );

  const loadPlaylist = useCallback(
    async (scene: string | null) => {
      setError(null);
      try {
        const query = scene ? `?category=${encodeURIComponent(scene)}` : "";
        const res = await fetch(`/api/music/list${query}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setError(data?.error ?? "获取歌单失败");
          return;
        }
        const list = (data.data ?? []) as MusicItem[];
        playlistRef.current = list;
        setPlaylist(list);
        if (list.length === 0) {
          setError("暂无可用音乐，请到后台添加");
          return;
        }
        prepareTrack(list, 0, false);
      } catch {
        setError("网络异常，无法加载歌单");
      }
    },
    [prepareTrack],
  );

  // 初始化：恢复播放列表 / 音量 / 播放模式，并监听场景切换事件
  useEffect(() => {
    const storedVolume = loadVolume();
    const persist = loadMusicPersist();

    setVolume(persist?.volume ?? storedVolume ?? 0.8);
    setMuted(false);

    if (persist && persist.playlist.length > 0) {
      playlistRef.current = persist.playlist;
      setPlaylist(persist.playlist);
      setMode(persist.mode);
      modeRef.current = persist.mode;
      const index = Math.min(Math.max(persist.index, 0), persist.playlist.length - 1);
      prepareTrack(persist.playlist, index, false);
    } else {
      loadPlaylist(null);
    }

    const onScene = (event: Event) => {
      const detail = (event as CustomEvent<string | null>).detail;
      loadPlaylist(detail ?? null);
    };
    window.addEventListener(MUSIC_SCENE_EVENT, onScene);
    return () => window.removeEventListener(MUSIC_SCENE_EVENT, onScene);
  }, [loadPlaylist, prepareTrack]);

  // 持久化播放列表 / 当前歌曲 / 播放模式
  useEffect(() => {
    if (playlist.length === 0) return;
    saveMusicPersist({ playlist, index: currentIndex, mode, volume });
  }, [playlist, currentIndex, mode, volume]);

  useEffect(() => {
    saveVolume(volume);
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
  }, [muted]);

  const current = playlist[currentIndex] ?? null;

  const togglePlay = () => {
    if (!playlist.length) {
      loadPlaylist(null);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src || !current) {
      prepareTrack(playlist, currentIndex, true);
      return;
    }
    if (audio.paused) {
      setError(null);
      audio.play().catch(() => {
        setIsPlaying(false);
        setLoading(false);
        setError("播放失败，请重试");
      });
    } else {
      audio.pause();
    }
  };

  const playNext = () => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    prepareTrack(list, nextIndex(list, currentIndexRef.current, modeRef.current), true);
  };

  const playPrev = () => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    prepareTrack(list, prevIndex(list, currentIndexRef.current, modeRef.current), true);
  };

  const collapse = () => {
    setClosing(true);
    window.setTimeout(() => {
      setExpanded(false);
      setClosing(false);
    }, 280);
  };

  const cycleMode = () => {
    setMode((m) => (m === "order" ? "single" : m === "single" ? "shuffle" : "order"));
  };

  const onSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const onVolumeChange = (value: number) => {
    setVolume(value);
    setMuted(false);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = value;
      audio.muted = false;
    }
  };

  const activeLyricIndex = useMemo(() => {
    if (!lyrics.length) return -1;
    let index = -1;
    for (let i = 0; i < lyrics.length; i += 1) {
      if (currentTime >= lyrics[i].time) index = i;
      else break;
    }
    return index;
  }, [lyrics, currentTime]);

  useEffect(() => {
    const active = lyricBoxRef.current?.querySelector('[data-active="true"]');
    active?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [activeLyricIndex]);

  const ModeIcon = MODE_ICON[mode];

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        className={isAdmin ? "hidden" : undefined}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={playNext}
        onError={() => {
          setIsPlaying(false);
          setLoading(false);
          setError("音乐加载失败，请检查文件地址或网络");
        }}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio) setCurrentTime(audio.currentTime);
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio) setDuration(audio.duration || 0);
        }}
        onCanPlay={() => setLoading(false)}
        onWaiting={() => setLoading(true)}
        onPlaying={() => {
          setLoading(false);
          setIsPlaying(true);
        }}
        onStalled={() => setError("网络异常，正在缓冲...")}
        onAbort={() => setLoading(false)}
      />

      {!isAdmin && (
        <>
          {/* 收起状态：圆形悬浮按钮 */}
          {!expanded && (
            <button
              aria-label="展开音乐播放器"
              onClick={() => setExpanded(true)}
              className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/70 bg-card/90 text-foreground shadow-candy backdrop-blur transition hover:scale-105 dark:border-white/10"
            >
              {current?.cover ? (
                <img
                  src={current.cover}
                  alt={current.title}
                  className={cn(
                    "h-12 w-12 rounded-full object-cover",
                    isPlaying && "music-cover-spinning",
                  )}
                />
              ) : (
                <Music2 className={cn("h-6 w-6", isPlaying && "music-note-bounce")} />
              )}
              {loading && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-card text-primary shadow">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                </span>
              )}
            </button>
          )}

          {/* 展开状态：悬浮卡片 */}
          {(expanded || closing) && (
            <div className="fixed bottom-20 left-4 right-4 z-50 sm:left-auto sm:w-[23rem]">
              <div className={cn(
                "rounded-[1.5rem] border-2 border-white/70 bg-card/95 p-4 shadow-candy backdrop-blur dark:border-white/10",
                closing ? "music-panel-out" : "music-panel",
              )}>
                {/* 歌词面板 */}
                {showLyrics && (
                  <div
                    ref={lyricBoxRef}
                    className="music-lyric-scroll mb-3 max-h-52 overflow-y-auto rounded-2xl bg-muted/50 px-3 py-2 text-center"
                  >
                    {lyrics.length === 0 ? (
                      <p className="py-6 text-sm text-muted-foreground">暂无歌词</p>
                    ) : (
                      <ul className="space-y-2">
                        {lyrics.map((line, i) => (
                          <li
                            key={`${line.time}-${i}`}
                            data-active={i === activeLyricIndex}
                            className={cn(
                              "text-sm leading-relaxed transition-all duration-300",
                              i === activeLyricIndex
                                ? "scale-105 font-semibold text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            {line.text || "♪"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 错误 / 加载提示 */}
                {error && (
                  <div className="mb-3 flex items-start gap-2 rounded-2xl bg-red-50 px-3 py-2 text-xs text-red-500 dark:bg-red-950/40">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">{error}</span>
                    <button
                      aria-label="关闭提示"
                      onClick={() => setError(null)}
                      className="shrink-0 opacity-70 hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {/* 封面 */}
                  <button
                    aria-label={showLyrics ? "收起歌词" : "显示歌词"}
                    onClick={() => setShowLyrics((v) => !v)}
                    className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-pink-100 bg-muted dark:border-pink-500/20"
                  >
                    {current?.cover ? (
                      <img
                        src={current.cover}
                        alt={current.title}
                        className={cn(
                          "h-full w-full object-cover",
                          isPlaying && "music-cover-spinning",
                        )}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center">
                        <Music2 className="h-7 w-7 text-muted-foreground" />
                      </span>
                    )}
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </span>
                    )}
                  </button>

                  {/* 歌曲信息 + 进度条 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">
                        {current ? current.title : "暂无音乐"}
                      </p>
                      <button
                        aria-label="显示歌词"
                        onClick={() => setShowLyrics((v) => !v)}
                        className={cn(
                          "shrink-0 rounded-full p-1 text-xs transition",
                          showLyrics
                            ? "bg-pink-100 text-pink-500 dark:bg-pink-500/20"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        词
                      </button>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {current ? current.artist : "点击下方播放按钮开始"}
                    </p>

                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="w-9 text-right text-[10px] tabular-nums text-muted-foreground">
                        {formatTime(currentTime)}
                      </span>
                      <input
                        aria-label="播放进度"
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={Math.min(currentTime, duration || 0)}
                        onChange={(e) => onSeek(Number(e.target.value))}
                        className="music-range flex-1"
                      />
                      <span className="w-9 text-[10px] tabular-nums text-muted-foreground">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* 收起 */}
                  <button
                    aria-label="收起播放器"
                    onClick={collapse}
                    className="shrink-0 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                {/* 控制按钮 */}
                <div className="mt-3 flex items-center justify-between">
                  <button
                    aria-label={MODE_LABEL[mode]}
                    title={MODE_LABEL[mode]}
                    onClick={cycleMode}
                    className="music-control-btn"
                  >
                    <ModeIcon className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button aria-label="上一首" onClick={playPrev} className="music-control-btn">
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button
                      aria-label={isPlaying ? "暂停" : "播放"}
                      onClick={togglePlay}
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-400 text-white shadow-soft transition hover:scale-105 active:scale-95",
                        isPlaying && "music-play-active",
                      )}
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="ml-0.5 h-5 w-5" />
                      )}
                    </button>
                    <button aria-label="下一首" onClick={playNext} className="music-control-btn">
                      <SkipForward className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label={muted ? "取消静音" : "静音"}
                      onClick={() => setMuted((v) => !v)}
                      className="music-control-btn"
                    >
                      {muted || volume === 0 ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      aria-label="音量"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={muted ? 0 : volume}
                      onChange={(e) => onVolumeChange(Number(e.target.value))}
                      className="music-range w-16"
                    />
                  </div>
                </div>

                {/* 展开歌词提示 */}
                {!showLyrics && current?.lyric && (
                  <button
                    onClick={() => setShowLyrics(true)}
                    className="mt-2 flex w-full items-center justify-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    查看歌词
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
