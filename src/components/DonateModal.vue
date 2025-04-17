<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="close-btn" @click="$emit('close')">×</button>
      <h2>Ủng hộ tác giả</h2>
      <p>Bạn có thể ủng hộ qua các hình thức sau:</p>
      <div class="pay-section">
        <button class="pay-btn" @click="donateMomo">Ủng hộ qua Momo</button>
        <a href="https://www.paypal.com/paypalme/yourpaypal" target="_blank" class="pay-btn">Ủng hộ qua PayPal</a>
      </div>
      <!-- <img src="/momo-qr.pngcomposer create-project laravel/laravel reminder-backend
      cd reminder-backend" alt="QR Momo" class="qr-img" /> -->
      <p class="note">Mọi sự ủng hộ là động lực để phát triển app tốt hơn! Xin cảm ơn ❤️</p>
    </div>
  </div>
</template>
<script setup>
const emit = defineEmits(['close']);
const donateMomo = () => {
  window.open('https://momo.vn', '_blank');
};
</script>
<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.35); z-index: 4000;
  display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: #fff; border-radius: 18px; max-width: 95vw; width: 340px;
  padding: 2rem 1.5rem 1.2rem; box-shadow: 0 6px 32px rgba(44,62,80,0.18);
  position: relative;
}
.close-btn {
  position: absolute; top: 0.6rem; right: 1rem;
  background: none; border: none; font-size: 1.5rem; cursor: pointer;
}
.pay-section { margin: 1.2rem 0 1.2rem 0; }
.pay-btn {
  display: block; width: 100%; margin-bottom: 0.7em;
  background: linear-gradient(90deg,#f687b3,#ecc94b); color: #fff;
  border: none; border-radius: 8px; padding: 0.7em 0; font-size: 1.08em;
  font-weight: 600; cursor: pointer; text-align: center; text-decoration: none;
  transition: background 0.2s;
}
.pay-btn:hover { background: linear-gradient(90deg,#ecc94b,#f687b3); }
.qr-img {
  display: block; margin: 1.2em auto 0.5em auto; width: 150px; border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.09);
}
.note { font-size: 0.92em; color: #555; margin-top: 0.5em; text-align: center; }
</style>
