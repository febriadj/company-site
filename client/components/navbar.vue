<template>
  <div :class="$style.navbar">
    <div :class="$style['navbar-wrap']">
      <h3 :class="$style.logo">Company A+</h3>
      <div :class="$style.right">
        <button
          type="button"
          :class="$style.btn"
          @click="handleLoginFormIsOpen"
          v-if="!isLoggedIn()"
        >
          <p class="text">Sign In</p>
          <i class="bx bx-user"></i>
        </button>
        <button
          type="button"
          :class="$style.btn"
          @click="handleTest"
          v-if="isLoggedIn()"
        >
          <i class="bx bx-user"></i>
        </button>
        <button
          type="button"
          :class="[$style.btn, $style['logout-btn']]"
          @click="handleLogoutIsOpen"
          v-if="isLoggedIn()"
        >
          <i class="bx bx-exit"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navigation-bar',
  props: {
    handleLoginFormIsOpen: Function,
    handleLogoutIsOpen: Function,
  },
  methods: {
    handleTest() { console.log('test') },
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
  },
  updated() {
    this.isLoggedIn();
  },
}
</script>

<style module>
.navbar {
  background: #ffffff;
}
.navbar-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-family: var(--font-body);
}
.right {
  display: flex;
  align-items: center;
  gap: 20px;
}
.right .btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.right .btn i {
  font-size: 1.5rem;
}
</style>
