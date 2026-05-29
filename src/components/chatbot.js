export function initChatbot() {
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotMinimize = document.getElementById('chatbot-minimize');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotSuggestions = document.getElementById('chatbot-suggestions');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSendBtn = document.getElementById('chatbot-send-btn');
  const triggerChatBtns = document.querySelectorAll('.trigger-chat-btn');

  // Check if all elements exist
  if (!chatbotToggle || !chatbotWindow || !chatbotMinimize || !chatbotMessages || !chatbotSuggestions || !chatbotInput || !chatbotSendBtn) {
    console.warn('Chatbot UI elements not fully found in HTML');
    return;
  }

  // Pre-configured questions and answers database
  const qaDatabase = {
    skills: {
      question: "What are your skills?",
      answer: `<strong>Rudra's Technical Arsenal:</strong><br/>
      • <strong>Languages:</strong> Core Java (Data Structures & Algorithms), JavaScript (ES6+), Python (Basic).<br/>
      • <strong>Web Dev:</strong> HTML5, CSS3, Tailwind CSS, React.js, Node.js, Express.js.<br/>
      • <strong>Database:</strong> MongoDB, MongoDB Atlas (Cloud database).<br/>
      • <strong>Cloud & Tools:</strong> AWS (EC2/S3 basics), Git, GitHub version control.`
    },
    projects: {
      question: "Tell me about your projects",
      answer: `<strong>Academic Projects Engineered by Rudra:</strong><br/><br/>
      1. <strong>SigmaGPT (AI Chat App):</strong><br/>
      Full-stack chatbot utilizing the MERN stack and OpenAI APIs to produce real-time AI conversation logs. Built robust custom APIs.<br/><br/>
      2. <strong>WanderLust (Destination Booking):</strong><br/>
      Platform supporting full user profiles, CRUD entries for renting places, dynamic reviews, and secure image upload integrations using Cloudinary.`
    },
    education: {
      question: "What is your education?",
      answer: `<strong>Rudra's Academic Path:</strong><br/>
      • <strong>MCA (Pursuing, 2025-2027):</strong> College of Engineering and Technology Roorkee (COER). Focusing on scalable systems.<br/>
      • <strong>BCA (2022-2025):</strong> College of Engineering and Technology Roorkee. Foundational computer science.<br/>
      • <strong>XII CBSE (2022):</strong> Holy Ganges Public School, Uttarakhand (PCM focus).`
    },
    youtube: {
      question: "Tell me about your YouTube channel",
      answer: `<strong>Rudra's Creative Ventures:</strong><br/>
      He operates the high-performing <strong><a href="https://www.youtube.com/@Allinchannel1" target="_blank" rel="noopener noreferrer" style="text-decoration: underline; color: var(--accent-cyan);">All in channel</a></strong> on YouTube, scaling it to over <strong>50,600+ subscribers</strong> and over <strong>5 Million cumulative views</strong>!<br/>
      Through this channel, he creates high-quality digital content, manages video editing campaigns, and excels in building organic digital communities.`
    },
    contact: {
      question: "How do I contact you?",
      answer: `<strong>Connect with Rudra Verma directly:</strong><br/>
      • ✉️ <strong>Email:</strong> <a href="mailto:rudraverma5510@gmail.com" style="text-decoration: underline; color: var(--accent-cyan);">rudraverma5510@gmail.com</a><br/>
      • 🐙 <strong>GitHub:</strong> <a href="https://github.com/Rudra55-work" target="_blank" style="text-decoration: underline; color: var(--accent-cyan);">@Rudra55-work</a><br/>
      • 🔗 <strong>LinkedIn:</strong> <a href="https://linkedin.com/in/Rudra Verma" target="_blank" style="text-decoration: underline; color: var(--accent-cyan);">Rudra Verma</a><br/><br/>
      Feel free to fill out the contact form at the bottom of the page too!`
    }
  };

  const suggestions = [
    { key: 'skills', text: '💡 Core Skills' },
    { key: 'projects', text: '🚀 Projects' },
    { key: 'education', text: '🎓 Education' },
    { key: 'youtube', text: '🎥 YouTube' },
    { key: 'contact', text: '✉️ Contact' }
  ];

  // ==========================================================================
  // Toggle States
  // ==========================================================================
  const toggleChat = () => {
    const isHidden = chatbotWindow.classList.contains('hidden');
    if (isHidden) {
      chatbotWindow.classList.remove('hidden');
      chatbotToggle.querySelector('.chat-open-icon').classList.add('hidden');
      chatbotToggle.querySelector('.chat-close-icon').classList.remove('hidden');
      chatbotToggle.classList.add('active');
      chatbotInput.focus();
      
      // Mark alert badge as read
      const alert = chatbotToggle.querySelector('.chat-badge-alert');
      if (alert) alert.style.display = 'none';
    } else {
      chatbotWindow.classList.add('hidden');
      chatbotToggle.querySelector('.chat-open-icon').classList.remove('hidden');
      chatbotToggle.querySelector('.chat-close-icon').classList.add('hidden');
      chatbotToggle.classList.remove('active');
    }
  };

  chatbotToggle.addEventListener('click', toggleChat);
  chatbotMinimize.addEventListener('click', toggleChat);

  // Trigger Chat from project card button
  triggerChatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (chatbotWindow.classList.contains('hidden')) {
        toggleChat();
      }
      // Send message about project
      handleUserInput(qaDatabase.projects.question, 'projects');
    });
  });

  // ==========================================================================
  // Message Injection Core
  // ==========================================================================
  const addMessage = (text, sender = 'bot') => {
    const bubble = document.createElement('div');
    bubble.className = `chat-msg ${sender}`;
    bubble.innerHTML = text;
    chatbotMessages.appendChild(bubble);
    
    // Auto Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  const showTypingIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'chat-msg bot typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages.appendChild(indicator);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return indicator;
  };

  const removeTypingIndicator = () => {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  };

  // ==========================================================================
  // Bot Response Logic
  // ==========================================================================
  const getBotResponse = (text) => {
    const query = text.toLowerCase();
    
    if (query.includes('skill') || query.includes('language') || query.includes('tech') || query.includes('dsa') || query.includes('react')) {
      return qaDatabase.skills.answer;
    } else if (query.includes('project') || query.includes('sigmagpt') || query.includes('wanderlust') || query.includes('chat') || query.includes('mern')) {
      return qaDatabase.projects.answer;
    } else if (query.includes('education') || query.includes('college') || query.includes('mca') || query.includes('bca') || query.includes('coer')) {
      return qaDatabase.education.answer;
    } else if (query.includes('youtube') || query.includes('sub') || query.includes('video') || query.includes('creator') || query.includes('channel')) {
      return qaDatabase.youtube.answer;
    } else if (query.includes('contact') || query.includes('phone') || query.includes('email') || query.includes('gmail') || query.includes('reach')) {
      return qaDatabase.contact.answer;
    } else if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
      return `Hello! Absolute pleasure chatting with you. 😊 I'm SigmaGPT, Rudra's virtual AI representative. What can I help you discover about Rudra Verma?`;
    } else if (query.includes('system') || query.includes('design') || query.includes('architecture')) {
      return `Rudra is deeply interested in backend architectures, system design principles, and designing robust API patterns using Node.js and MongoDB.`;
    }
    
    // Default reply
    return `Interesting! As a dedicated virtual assistant, I'm fully trained on Rudra's credentials. Try asking me about:<br/>
    • His <strong>projects</strong> (MERN, AI Chat)<br/>
    • His core <strong>skills</strong> & languages<br/>
    • His <strong>education</strong> details (MCA/BCA)<br/>
    • His <strong>YouTube</strong> stats dashboard<br/>
    • How to <strong>contact</strong> him`;
  };

  const handleUserInput = (text, key = null) => {
    if (!text.trim()) return;

    // 1. Render User Bubble
    addMessage(text, 'user');
    chatbotInput.value = '';

    // 2. Show Typing Indicator
    showTypingIndicator();

    // 3. Simulated network delay for AI feel
    setTimeout(() => {
      removeTypingIndicator();
      let answer;
      if (key && qaDatabase[key]) {
        answer = qaDatabase[key].answer;
      } else {
        answer = getBotResponse(text);
      }
      addMessage(answer, 'bot');
    }, 900);
  };

  // Bind Input Form Controls
  chatbotSendBtn.addEventListener('click', () => {
    handleUserInput(chatbotInput.value);
  });

  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleUserInput(chatbotInput.value);
    }
  });

  // Render suggestion chips dynamically
  const initSuggestions = () => {
    chatbotSuggestions.innerHTML = '';
    suggestions.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'suggest-chip';
      chip.textContent = item.text;
      chip.addEventListener('click', () => {
        handleUserInput(qaDatabase[item.key].question, item.key);
      });
      chatbotSuggestions.appendChild(chip);
    });
  };

  // Initialize Chatbox view
  const initChat = () => {
    chatbotMessages.innerHTML = '';
    addMessage(`👋 <strong>Welcome to SigmaGPT!</strong><br/>
    I am an AI assistant mirroring Rudra's skills and accomplishments. Ask me any question, or click the quick suggestions below to explore!`, 'bot');
    initSuggestions();
  };

  initChat();
}
