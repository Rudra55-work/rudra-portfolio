export function initStats() {
  const statsDashboard = document.querySelector('.stats-dashboard');
  const countElements = document.querySelectorAll('.db-num');
  const graphLinePath = document.querySelector('.graph-line-path');
  const graphBgPath = document.querySelector('.graph-bg-path');
  const graphDotsContainer = document.querySelector('.graph-dots');

  if (!statsDashboard || countElements.length === 0 || !graphLinePath || !graphBgPath || !graphDotsContainer) {
    console.warn('Stats dashboard elements not fully found in HTML');
    return;
  }

  // 1. Organic Bezier Path Coordinates (X: 0 to 300, Y: 100 to 0 (top is 0))
  // Coordinates representing the subscriber milestones
  const coordinates = [
    { x: 10, y: 90, label: 'Start' },
    { x: 60, y: 82, label: '1K' },
    { x: 110, y: 72, label: '5K' },
    { x: 160, y: 55, label: '15K' },
    { x: 210, y: 35, label: '30K' },
    { x: 260, y: 18, label: '45K' },
    { x: 300, y: 8, label: '50.6K' }
  ];

  // ==========================================================================
  // Generate SVG Bezier Curves
  // ==========================================================================
  const buildSvgPath = () => {
    // Generate Catmull-Rom or Bezier coordinates for smooth spline
    let pathD = `M ${coordinates[0].x},${coordinates[0].y}`;
    
    for (let i = 0; i < coordinates.length - 1; i++) {
      const p0 = coordinates[i];
      const p1 = coordinates[i + 1];
      // Midpoint control values for smooth organic curves
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      
      pathD += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`;
    }
    
    // Set line path
    graphLinePath.setAttribute('d', pathD);
    
    // Set background gradient filled path
    const bgPathD = `${pathD} L 300,100 L 0,100 Z`;
    graphBgPath.setAttribute('d', bgPathD);
  };

  // Plot milestone dots dynamically
  const plotMilestoneDots = () => {
    graphDotsContainer.innerHTML = '';
    
    coordinates.forEach((point, index) => {
      // Create SVG group
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.className.baseVal = 'graph-milestone-group';
      
      // Plot interactive dot
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', point.x);
      circle.setAttribute('cy', point.y);
      circle.setAttribute('r', '4');
      circle.className.baseVal = 'graph-dot';
      
      // Delay dot appearance for growth animation timeline
      circle.style.animationDelay = `${index * 0.3}s`;
      
      // Plot mini label text above dot
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', point.x);
      text.setAttribute('y', point.y - 8);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'var(--text-muted)');
      text.setAttribute('font-size', '6px');
      text.setAttribute('font-family', 'var(--font-code)');
      text.style.opacity = '0';
      text.style.transition = 'opacity 0.5s ease 2.5s';
      text.textContent = point.label;
      
      group.appendChild(circle);
      group.appendChild(text);
      graphDotsContainer.appendChild(group);
      
      // Hover event listeners to increase radius
      circle.addEventListener('mouseenter', () => {
        circle.setAttribute('r', '7');
        circle.style.fill = 'var(--accent-cyan)';
        text.style.opacity = '1';
        text.setAttribute('fill', 'var(--text-primary)');
      });
      
      circle.addEventListener('mouseleave', () => {
        circle.setAttribute('r', '4');
        circle.style.fill = '#ef4444';
        text.style.opacity = '0';
        text.setAttribute('fill', 'var(--text-muted)');
      });
      
      // Proactively trigger text labels fade in on load
      setTimeout(() => {
        text.style.opacity = '0.7';
      }, 3000);
    });
  };

  // ==========================================================================
  // Number Counters Animation Logic
  // ==========================================================================
  const formatNumber = (num, id) => {
    if (id === 'stat-subscribers') {
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K+';
      }
      return num;
    }
    
    if (id === 'stat-views') {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M+';
      }
      return num;
    }
    
    if (id === 'stat-ctr') {
      return num.toFixed(1) + '%';
    }
    
    return num.toLocaleString();
  };

  const animateCounters = () => {
    const duration = 2200; // total animation time in ms
    
    countElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const id = el.id;
      const startTimestamp = performance.now();
      
      const step = (now) => {
        const elapsed = now - startTimestamp;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out quadratic function
        const easeProgress = progress * (2 - progress);
        
        const currentValue = easeProgress * target;
        el.textContent = formatNumber(currentValue, id);
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target, id);
        }
      };
      
      window.requestAnimationFrame(step);
    });
  };

  // ==========================================================================
  // Trigger on Viewport Entry
  // ==========================================================================
  let isAnimated = false;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isAnimated) {
        isAnimated = true;
        
        // Build graph elements
        buildSvgPath();
        plotMilestoneDots();
        
        // Animate counter values
        animateCounters();
      }
    });
  }, { threshold: 0.2 });

  observer.observe(statsDashboard);
}
