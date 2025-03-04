import React from 'react';
import '../assets/css/AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-header">
        <h1>About Our Project</h1>
        <p className="lead-text">
          Learn more about our application, team, and technology stack.
        </p>
      </section>

      <section className="about-content">
        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a seamless, user-friendly web application that demonstrates
            the integration of React frontend with MySQL database via a RESTful API. We aim to provide
            a solid foundation for scalable web applications using modern technologies and best practices.
          </p>
        </div>

        <div className="about-card">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <h3>Frontend</h3>
              <ul>
                <li>React.js</li>
                <li>React Router</li>
                <li>Axios</li>
                <li>CSS3</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Backend</h3>
              <ul>
                <li>Node.js</li>
                <li>Express</li>
                <li>RESTful API</li>
                <li>JWT Authentication</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>Database</h3>
              <ul>
                <li>MySQL</li>
                <li>Sequelize ORM</li>
              </ul>
            </div>
            <div className="tech-item">
              <h3>DevOps</h3>
              <ul>
                <li>Docker</li>
                <li>Git</li>
                <li>GitHub</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="about-card">
          <h2>Project Features</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">Responsive user interface built with React</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">RESTful API for data operations</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">Secure data storage with MySQL</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">Containerized with Docker for easy deployment</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">Modern, clean UI design</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span className="feature-text">Organized code structure following best practices</span>
            </li>
          </ul>
        </div>

        <div className="about-card">
          <h2>Our Team</h2>
          <div className="team-members">
            <div className="team-member">
              <div className="member-avatar">
                {/* Placeholder for team member photo */}
                <div className="avatar-placeholder">DP</div>
              </div>
              <h3>Developer Name</h3>
              <p>Full Stack Developer</p>
            </div>
            {/* You can add more team members here if needed */}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h2>Get In Touch</h2>
        <p>Have questions about the project? Feel free to reach out!</p>
        <button className="contact-button">Contact Us</button>
      </section>
    </div>
  );
};

export default AboutPage;