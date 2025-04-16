<script setup>
// Không cần logic động, chỉ hiển thị thông tin tĩnh
</script>

<template>
  <div class="about-container">
    <h2 class="about-title">About</h2>
    <div class="about-content">
      <h3>Về Dự Án Posture Reminder</h3>
      <p>
        <strong>Posture Reminder</strong> là một ứng dụng web hỗ trợ người dùng thực hành thiền và cải thiện tư thế khi làm việc. Dự án được xây dựng để giúp người dùng thư giãn, tập trung và duy trì sức khỏe thông qua các bài tập thở và nhắc nhở tư thế.
      </p>
      <p>
        Ứng dụng tích hợp tính năng theo dõi số người online theo thời gian thực, sử dụng Firebase Realtime Database, và có giao diện thân thiện với người dùng.
      </p>
      <p class="author">
        Tác giả: Vũ Hoàng Thạch  
        <br>
        Email: <a href="mailto:vuhoangthach1402@gmail.com">vuhoangthach1402@gmail.com</a>  
        <br>
        Zalo: <a href="tel:0902570674">0902570674</a>  
        <br>
        GitHub: <a href="https://github.com/hoangthach1402/reminder">github.com/hoangthach1402/reminder</a>
      </p>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.about-title {
  color: #818181;
  font-size: 1.5rem;
  margin-bottom: 10px;
  font-weight: bold;
}

.about-content h3 {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 10px;
}

.about-content p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
}

.about-content .author {
  font-weight: bold;
  color: #2c3e50;
}

.about-content a {
  color: #4caf50;
  text-decoration: none;
  font-weight: bold;
}

.about-content a:hover {
  text-decoration: underline;
}
</style>