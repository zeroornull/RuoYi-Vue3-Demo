<script setup lang="ts">
import notFoundImage from "../../assets/404_images/404.png";
import cloudImage from "../../assets/404_images/404_cloud.png";

defineOptions({ name: "NotFound" });
</script>

<template>
  <div class="wscn-http404-container">
    <div class="wscn-http404">
      <div class="pic-404">
        <img class="pic-404__parent" :src="notFoundImage" alt="404" />
        <img class="pic-404__child left" :src="cloudImage" alt="" />
        <img class="pic-404__child mid" :src="cloudImage" alt="" />
        <img class="pic-404__child right" :src="cloudImage" alt="" />
      </div>
      <div class="bullshit">
        <div class="bullshit__oops">404错误!</div>
        <div class="bullshit__headline">找不到网页！</div>
        <div class="bullshit__info">
          对不起，您正在寻找的页面不存在。尝试检查URL的错误，然后按浏览器上的刷新按钮或尝试在我们的应用程序中找到其他内容。
        </div>
        <router-link to="/index" class="bullshit__return-home">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wscn-http404-container {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wscn-http404 {
  position: relative;
  width: min(1200px, 100vw);
  padding: 0 50px;
  overflow: hidden;
}

.pic-404 {
  position: relative;
  float: left;
  width: 600px;
  max-width: 100%;
}

.pic-404__parent {
  width: 100%;
}

.pic-404__child {
  position: absolute;
  opacity: 0;
}

.pic-404__child.left {
  top: 17px;
  left: 220px;
  width: 80px;
  animation: cloudLeft 2s linear 1s forwards;
}

.pic-404__child.mid {
  top: 10px;
  left: 420px;
  width: 46px;
  animation: cloudMid 2s linear 1.2s forwards;
}

.pic-404__child.right {
  top: 100px;
  left: 500px;
  width: 62px;
  animation: cloudRight 2s linear 1s forwards;
}

.bullshit {
  position: relative;
  float: left;
  width: 300px;
  padding: 30px 0;
}

.bullshit__oops,
.bullshit__headline,
.bullshit__info,
.bullshit__return-home {
  opacity: 0;
  animation: slideUp 0.5s forwards;
}

.bullshit__oops {
  margin-bottom: 20px;
  color: #1482f0;
  font-size: 32px;
  font-weight: 700;
}

.bullshit__headline {
  margin-bottom: 10px;
  color: #222;
  font-size: 20px;
  font-weight: 700;
  animation-delay: 0.1s;
}

.bullshit__info {
  margin-bottom: 30px;
  color: grey;
  font-size: 13px;
  animation-delay: 0.2s;
}

.bullshit__return-home {
  display: block;
  width: 110px;
  height: 36px;
  color: #fff;
  font-size: 14px;
  line-height: 36px;
  text-align: center;
  background: #1482f0;
  border-radius: 100px;
  animation-delay: 0.3s;
}

@keyframes cloudLeft {
  0% {
    top: 17px;
    left: 220px;
    opacity: 0;
  }
  20% {
    top: 33px;
    left: 188px;
    opacity: 1;
  }
  80% {
    top: 81px;
    left: 92px;
    opacity: 1;
  }
  100% {
    top: 97px;
    left: 60px;
    opacity: 0;
  }
}

@keyframes cloudMid {
  0% {
    top: 10px;
    left: 420px;
    opacity: 0;
  }
  20% {
    top: 40px;
    left: 360px;
    opacity: 1;
  }
  70% {
    top: 130px;
    left: 180px;
    opacity: 1;
  }
  100% {
    top: 160px;
    left: 120px;
    opacity: 0;
  }
}

@keyframes cloudRight {
  0% {
    top: 100px;
    left: 500px;
    opacity: 0;
  }
  20% {
    top: 120px;
    left: 460px;
    opacity: 1;
  }
  80% {
    top: 180px;
    left: 340px;
    opacity: 1;
  }
  100% {
    top: 200px;
    left: 300px;
    opacity: 0;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(60px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
