const CURRENT_YEAR = new Date().getFullYear();
export const EMAIL_WELCOME_TEMPLATE = `<!DOCTYPE html>

<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>Welcome to StackUp</title>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@600&display=swap" rel="stylesheet">

<style>
  body {
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: 'Montserrat', sans-serif;
    color: #333333;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  .container {
    max-width: 650px;
    margin: 40px auto;
    background: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  .header {
 
    text-align: center;
    padding: 40px 20px;
  }

  .header h1 {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #ffffff;
    margin: 0;
  }
  .content {
    padding: 50px 40px 40px;
    text-align: left;
  }
  .content h2 {
    color: #2c3e50;
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    margin-bottom: 15px;
  }
  p {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 20px;
  }
  ul {
    padding-left: 20px;
    margin: 0 0 25px;
  }
  ul li {
    margin-bottom: 10px;
  }
  .highlight {
    background-color: #f8f9fa;
    border-left: 4px solid #2c3e50;
    padding: 10px 15px;
    border-radius: 5px;
    font-style: italic;
    color: #444;
  }
  .cta {
    text-align: center;
    margin: 30px 0;
  }
  .cta a {
    display: inline-block;
    background: #2c3e50;
    color: #ffffff !important;
    text-decoration: none;
    padding: 15px 45px;
    border-radius: 5px;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  .cta a:hover {
    background: #34495e;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
  .signature {
    margin-top: 30px;
  }
  .signature strong {
    color: #2c3e50;
  }
  .footer {
    background: #f8f9fa;
    text-align: center;
    padding: 40px 20px 25px;
    border-top: 1px solid #e0e0e0;
  }
  .footer p {
    font-size: 14px;
    line-height: 1.8;
    margin: 0 0 15px;
  }
  .footer .social-icons img {
    width: 32px;
    margin: 0 8px;
    vertical-align: middle;
  }
  .motto {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    color: #2c3e50;
    font-weight: 600;
    margin: 20px 0 10px;
  }
  a {
    color: #2c3e50;
    text-decoration: none;
  }
  @media (max-width: 600px) {
    .content { padding: 30px 20px; }
    .cta a { padding: 12px 30px; font-size: 15px; }
  }
</style>
</head>

<body>
  <table role="presentation">
    <tr>
      <td align="center">
        <div class="container">
          
          <!-- Header -->
          <div class="header">
            <img src="https://res.cloudinary.com/duhixbf4x/image/upload/v1739083156/image-2_tap9kz.png" alt="StackUp Logo" width="320" height="140">
            <h1>Welcome to the StackUp Family!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <h2>Hi {{name}},</h2>
            <p>
              You've just made an incredible choice — joining a learning community that believes in your growth as much as you do. 🌱  
              At <strong>StackUp</strong>, every learner's journey is special, and we're thrilled to have you with us.
            </p>

            <div class="highlight">
              "You didn't just sign up for a course — you invested in a brighter version of yourself."
            </div>

            <p><strong>Here's what's waiting for you inside StackUp:</strong></p>
            <ul>
              <li>✨ Industry-relevant courses crafted for real-world success.</li>
              <li>📊 A personalized dashboard to track your goals and achievements.</li>
              <li>🤝 Supportive mentors and a thriving community to learn with.</li>
            </ul>

            <p>Your learning space is ready and waiting — take your first step toward success:</p>

            <div class="cta">
              <a href="{{Dashboard_Link}}">Start Your Learning Journey</a>
            </div>

            <p>
              Have questions or need a helping hand?  
              Reach us anytime at  
              <a href="mailto:academics@stackuplearning.com" style="color:#2c3e50;text-decoration:none;"><strong>academics@stackuplearning.com</strong></a>
            </p>

            <div class="signature">
              <p>With warm regards,<br>
              <strong>The StackUp Team</strong></p>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="social-icons">
              <a href="https://www.linkedin.com/company/stackup-learning/" target="_blank"><img src="https://res.cloudinary.com/duhixbf4x/image/upload/v1739083155/image-3_ggaigm.png" alt="LinkedIn"></a>
              <a href="https://www.instagram.com/stackuplearning/" target="_blank"><img src="https://res.cloudinary.com/duhixbf4x/image/upload/v1739083156/image-4_grpun7.png" alt="Instagram"></a>
              <a href="https://www.youtube.com/@stackuplearninghub/videos" target="_blank">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png" alt="yt" width="45" style="display:inline-block; />
            </a>
             </div>

            <p>
              At StackUp, we're more than just a platform — we're your learning partner.  
              Let's build, grow, and celebrate every win together. 🌟
            </p>

            <p class="motto">Keep Learning. Keep Growing. Keep Stacking Up!</p>

           <p style="color:#888;">© ${CURRENT_YEAR} StackUp Learning. All rights reserved.</p>
          </div>

        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;