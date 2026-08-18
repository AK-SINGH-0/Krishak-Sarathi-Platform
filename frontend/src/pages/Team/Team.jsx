import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  BsGithub, BsLinkedin, BsEnvelopeFill,
  BsPatchCheckFill, BsMortarboardFill, BsBuilding,
} from "react-icons/bs";
import "./Team.css";
import logoImg from "../../assets/images/logo_ks1.png";

import sushilImg from "../../assets/images/sushil.jpeg";
import ankushImg from "../../assets/images/ankush.png";
import bijanshuImg from "../../assets/images/bijanshu.png";
import nirajImg from "../../assets/images/nirajsir.png";

// Reveal-on-scroll preset for the sections further down the page
const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, delay, ease: "easeOut" },
});

// The hero is always above the fold, so it animates on mount rather than on
// scroll — that keeps it visible even if scroll detection never fires.
const revealOnMount = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const Team = () => {
  const { t } = useTranslation();

  const developers = [
    {
      id: 1,
      image: sushilImg,
      name: "Sushil Kumar",
      degree: t('team.developers.sushil.degree'),
      university: t('team.developers.sushil.university'),
      designation: t('team.developers.sushil.designation'),
      role: t('team.developers.sushil.role'),
      skills: t('team.developers.sushil.skills', { returnObjects: true }),
      social: {
        github: "https://github.com/sushilkumar121225",
        linkedin: "https://www.linkedin.com/in/sushil-kumar-471614289",
        email: "mailto:sushilkumarnk25102@gmail.com",
      }
    },

    {
      id: 2,
      image: ankushImg,
      name: "Ankush Kumar",
      degree: t('team.developers.ankush.degree'),
      university: t('team.developers.ankush.university'),
      designation: t('team.developers.ankush.designation'),
      role: t('team.developers.ankush.role'),
      skills: t('team.developers.ankush.skills', { returnObjects: true }),
      social: {
        github: "https://github.com/",
        linkedin: "https://www.linkedin.com/",
        email: "mailto:ankush@example.com",
      }
    },

    {
      id: 3,
      image: bijanshuImg,
      name: "Bijanshu Yadav",
      degree: t('team.developers.bijanshu.degree'),
      university: t('team.developers.bijanshu.university'),
      designation: t('team.developers.bijanshu.designation'),
      role: t('team.developers.bijanshu.role'),
      skills: t('team.developers.bijanshu.skills', { returnObjects: true }),
      social: {
        github: "https://github.com/",
        linkedin: "https://www.linkedin.com/",
        email: "mailto:bijanshu@example.com",
      }
    }
  ];

  const guideExpertise = t('team.guide.expertise', { returnObjects: true });

  return (
    <section className="team-page">

      {/* Hero */}

      <motion.div className="team-hero" {...revealOnMount}>

        <img
          src={logoImg}
          alt={t('common.logoAlt')}
          className="team-logo"
        />

        <h1>
          {t('team.hero.title')}
        </h1>

        <p>
          {t('team.hero.text')}
        </p>

      </motion.div>

      {/* Cards */}

      <div className="team-container">

        {developers.map((dev, index) => (

          <motion.div
            key={dev.id}
            className="team-card"
            {...reveal(index * 0.15)}
          >

            <div className="team-number">
              {dev.id}
            </div>

            <div className="profile-circle">
                <img
                    src={dev.image}
                    alt={dev.name}
                    className="profile-image"
                />
            </div>

            <h2>
              {dev.name}
            </h2>

            <h4>
              {dev.designation}
            </h4>

            <p className="degree">
              {dev.degree}
            </p>

            <p className="university">
              {dev.university}
            </p>

            <div className="social-links">
              <a href={dev.social.github} target="_blank" rel="noopener noreferrer" aria-label={`${dev.name} on GitHub`}>
                <BsGithub />
              </a>
              <a href={dev.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${dev.name} on LinkedIn`}>
                <BsLinkedin />
              </a>
              <a href={dev.social.email} aria-label={`Email ${dev.name}`}>
                <BsEnvelopeFill />
              </a>
            </div>

            <div className="role-box">

              <h5>
                {t('team.card.projectRole')}
              </h5>

              <p>
                {dev.role}
              </p>

            </div>

            <div className="skill-title">
              {t('team.card.skills')}

              <div className="skill-list">

                {dev.skills.map((skill, index) => (

                  <span
                    key={index}
                    className="skill-chip"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            </div>

          </motion.div>

        ))}

      </div>

      {/* Guide */}

      <motion.div className="guide-section" {...reveal()}>

        <div className="guide-heading">
          <h2>{t('team.guide.sectionTitle')}</h2>
          <p>{t('team.guide.sectionSubtitle')}</p>
        </div>

        <div className="guide-card">

          <div className="guide-photo-wrap">
            <div className="guide-photo-ring">
              <img src={nirajImg} alt={t('team.guide.name')} className="guide-photo" />
            </div>
            <span className="guide-badge">
              <BsPatchCheckFill /> {t('team.guide.badge')}
            </span>
          </div>

          <div className="guide-details">

            <h3>{t('team.guide.name')}</h3>
            <h4>{t('team.guide.designation')}</h4>

            <p className="guide-meta">
              <BsBuilding className="guide-meta-icon" /> {t('team.guide.department')}
            </p>
            <p className="guide-meta">
              <BsMortarboardFill className="guide-meta-icon" /> {t('team.guide.university')}
            </p>

            <p className="guide-message">{t('team.guide.message')}</p>

            <div className="guide-expertise">
              <h5>{t('team.guide.expertiseTitle')}</h5>
              <div className="skill-list guide-skill-list">
                {Array.isArray(guideExpertise) && guideExpertise.map((item, index) => (
                  <span key={index} className="skill-chip">{item}</span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </motion.div>

      {/* Project */}

      <motion.div className="project-info" {...reveal()}>

        <h2>
          {t('team.project.title')}
        </h2>

        <p>
          {t('team.project.text')}
        </p>

      </motion.div>

    </section>
  );
};

export default Team;
