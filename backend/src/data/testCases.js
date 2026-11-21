// All people, companies and projects are fictional.
export const testCases = [
  {
    id: 'TC1', title: 'Data Analyst Intern',
    resume: `Aanya Rao, BSc Statistics (Year 3), Fictional City University
Skills: Python, SQL, Excel, pandas
Projects:
- Built a sales dashboard in Tableau for a class project using a public retail dataset.
- Cleaned and analysed survey data with Python and pandas for a statistics course.
Experience:
- Student tutor: explained probability to 20 first-year students each week.`,
    jd: `Data Analyst Intern. Requirements: Python and SQL for data analysis; Tableau or Power BI dashboards; knowledge of statistics; experience with machine learning is a plus. Currently studying a quantitative degree.`,
    expected: { demonstrated: ['python', 'sql', 'tableau', 'statistics'], gaps: ['power bi', 'machine learning'] },
  },
  {
    id: 'TC2', title: 'Frontend Developer Intern',
    resume: `Ben Okafor, BSc Computer Science (Year 2), Example Institute of Technology
Skills: JavaScript, React, HTML, CSS, Git
Projects:
- Built a personal portfolio website with React and deployed it to GitHub Pages.
- Created a to-do app using React hooks and Git for version control with 3 teammates.
Experience:
- Volunteer web helper for a campus club, updating event pages.`,
    jd: `Frontend Developer Intern. Requirements: React and JavaScript; TypeScript; HTML/CSS; Git; writing unit tests with Jest; consuming REST APIs. Portfolio projects are valued.`,
    expected: { demonstrated: ['react', 'javascript', 'git', 'css'], gaps: ['typescript', 'jest', 'rest'] },
  },
  {
    id: 'TC3', title: 'Backend / Cloud Intern',
    resume: `Chloe Martins, BEng Software Engineering (Year 3), Sample State University
Skills: Java, Spring Boot, MySQL
Projects:
- Developed a library management REST API with Java and Spring Boot backed by MySQL.
- Presented the API to a class of 30 students and deployed it on a university lab server.`,
    jd: `Backend Intern. Requirements: Java and Spring Boot; MySQL or PostgreSQL; Docker containers; AWS or other cloud experience; REST API design; Linux basics.`,
    expected: { demonstrated: ['java', 'spring boot', 'mysql', 'rest'], gaps: ['docker', 'aws', 'linux'] },
  },
  {
    id: 'TC4', title: 'Digital Marketing Intern',
    resume: `Dev Patel, BBA Marketing (Year 2), Imaginary Business College
Skills: Canva, copywriting, social media
Experience:
- Ran the Instagram account of the marketing club and grew followers from 400 to 650 in one semester.
- Wrote 12 blog articles for the college newsletter.`,
    jd: `Digital Marketing Intern. Requirements: social media management; content writing; Canva or similar design tools; SEO basics; Google Analytics reporting; teamwork.`,
    expected: { demonstrated: ['social media', 'content writing', 'canva'], gaps: ['seo', 'google analytics'] },
  },
  {
    id: 'TC5', title: 'Machine Learning Research Intern',
    resume: `Elena Petrova, BSc Mathematics (Year 3), Hypothetical Polytechnic
Skills: Python, NumPy, scikit-learn
Courses: Completed an online Deep Learning specialisation (certificate).
Projects:
- Trained a logistic regression classifier with scikit-learn on a public housing dataset.`,
    jd: `ML Research Intern. Requirements: Python; PyTorch; scikit-learn; natural language processing (NLP); statistics and linear algebra; reading research papers.`,
    expected: { demonstrated: ['python', 'scikit-learn'], gaps: ['pytorch', 'nlp', 'research papers'] },
  },
];
