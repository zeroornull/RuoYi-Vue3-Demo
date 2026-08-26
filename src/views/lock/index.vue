<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { unlockScreen } from "../../api/login";
import { useLockStore } from "../../stores/modules/lock";
import { useUserStore } from "../../stores/modules/user";
import fallbackAvatarUrl from "../../assets/images/profile.jpg";
import {
  fallbackAvatar,
  formatLockDate,
  formatLockTime,
  unlockErrorMessage,
} from "./model";

defineOptions({ name: "Lock" });

const router = useRouter();
const userStore = useUserStore();
const lockStore = useLockStore();
const password = ref("");
const loading = ref(false);
const errorMsg = ref("");
const isShaking = ref(false);
const currentTime = ref("");
const currentDate = ref("");
const passwordInput = ref<HTMLInputElement | null>(null);
const particleCanvas = ref<HTMLCanvasElement | null>(null);
const avatarSrc = ref(fallbackAvatar(userStore.avatar, fallbackAvatarUrl));

let timer: ReturnType<typeof setInterval> | null = null;
let animationId = 0;

function tickClock(): void {
  const now = new Date();
  currentTime.value = formatLockTime(now);
  currentDate.value = formatLockDate(now);
}

function showError(message: string): void {
  errorMsg.value = message;
  isShaking.value = true;
  window.setTimeout(() => {
    isShaking.value = false;
  }, 600);
}

async function handleUnlock(): Promise<void> {
  if (!password.value) {
    showError("请输入密码");
    return;
  }
  loading.value = true;
  errorMsg.value = "";
  try {
    await unlockScreen(password.value);
    const lockPath = lockStore.lockPath;
    lockStore.unlockScreen();
    await router.replace(lockPath);
  } catch (error) {
    showError(unlockErrorMessage(error));
    password.value = "";
    await nextTick();
    passwordInput.value?.focus();
  } finally {
    loading.value = false;
  }
}

async function goLogin(): Promise<void> {
  lockStore.unlockScreen();
  try {
    await userStore.logOut();
  } catch {
    userStore.resetSession();
  }
  await router.push("/login");
}

function onAvatarError(): void {
  avatarSrc.value = fallbackAvatarUrl;
}

function initParticles(): void {
  const canvas = particleCanvas.value;
  if (!canvas) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const resize = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  const particles = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.6,
    dy: (Math.random() - 0.5) * 0.6,
    alpha: Math.random() * 0.5 + 0.2,
  }));
  const draw = (): void => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const particle of particles) {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${particle.alpha})`;
      ctx.fill();
      particle.x += particle.dx;
      particle.y += particle.dy;
      if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;
    }
    animationId = requestAnimationFrame(draw);
  };
  draw();
}

onMounted(() => {
  tickClock();
  timer = setInterval(tickClock, 1000);
  initParticles();
  void nextTick(() => passwordInput.value?.focus());
});

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
  cancelAnimationFrame(animationId);
});
</script>

<template>
  <div class="lock-container">
    <canvas ref="particleCanvas" class="particle-bg" />
    <div class="lock-time">{{ currentTime }}</div>
    <div class="lock-date">{{ currentDate }}</div>
    <div class="lock-card">
      <div class="avatar-wrap">
        <img :src="avatarSrc" alt="" class="lock-avatar" @error="onAvatarError" />
        <div class="lock-icon" aria-hidden="true">🔒</div>
      </div>
      <div class="lock-username">{{ userStore.nickName }}</div>
      <div class="lock-hint">系统已锁定，请输入密码解锁</div>
      <div class="input-wrap" :class="{ shake: isShaking }">
        <input
          ref="passwordInput"
          v-model="password"
          type="password"
          placeholder="请输入登录密码"
          class="lock-input"
          autocomplete="off"
          @keydown.enter="handleUnlock"
        />
        <button class="unlock-btn" type="button" :disabled="loading" @click="handleUnlock">
          <span v-if="!loading">→</span>
          <span v-else class="loading-dot">···</span>
        </button>
      </div>
      <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
      <div class="lock-footer">
        <button type="button" class="lock-logout" @click="goLogin">退出重新登录</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lock-container {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

.particle-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.lock-time,
.lock-date,
.lock-card {
  position: relative;
  z-index: 1;
}

.lock-time {
  margin-bottom: 8px;
  color: #fff;
  font-size: 72px;
  font-weight: 200;
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
}

.lock-date {
  margin-bottom: 48px;
  color: rgb(255 255 255 / 60%);
  font-size: 15px;
  letter-spacing: 2px;
}

.lock-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 360px;
  padding: 40px 48px;
  background: rgb(255 255 255 / 8%);
  border: 1px solid rgb(255 255 255 / 15%);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgb(0 0 0 / 40%);
  backdrop-filter: blur(20px);
}

.lock-avatar {
  display: block;
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 3px solid rgb(255 255 255 / 30%);
  border-radius: 50%;
}

.lock-username {
  margin: 16px 0 6px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.lock-hint {
  margin-bottom: 28px;
  color: rgb(255 255 255 / 50%);
  font-size: 13px;
}

.input-wrap {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 4px 4px 4px 20px;
  background: rgb(255 255 255 / 10%);
  border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 50px;
}

.input-wrap.shake {
  animation: shake 0.5s ease;
}

.lock-input {
  flex: 1;
  padding: 10px 0;
  color: #fff;
  font-size: 15px;
  background: transparent;
  border: 0;
  outline: none;
}

.unlock-btn {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: 0;
  border-radius: 50%;
}

.unlock-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.error-msg {
  margin-top: 14px;
  color: #ff7675;
  font-size: 13px;
}

.lock-footer {
  margin-top: 24px;
}

.lock-logout {
  color: rgb(255 255 255 / 40%);
  font-size: 13px;
  cursor: pointer;
  background: transparent;
  border: 0;
}

@keyframes shake {
  0%,
  100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}
</style>
