let abbreviationsData = {};

// Fetch the abbreviations data
async function fetchAbbreviations() {
  try {
    const response = await fetch('data/abbreviations.json');
    abbreviationsData = await response.json();
    generateTables();
  } catch (error) {
    console.error('Error loading abbreviations data:', error);
  }
}

// Function to normalize abbreviations by removing dots
function normalizeAbbr(abbr) {
  return abbr.toLowerCase().replace(/\./g, '');
}

// Function to generate the tables
function generateTables(filter = '', category = 'all') {
  const container = document.getElementById('abbreviations-container');
  container.innerHTML = '';
  
  let found = false;
  const normalizedFilter = normalizeAbbr(filter);
  
  // Function to check if an abbreviation matches the filter
  function matchesFilter(abbr, altAbbr) {
    if (!filter) return true;
    
    const normalizedAbbr = normalizeAbbr(abbr);
    return normalizedAbbr.includes(normalizedFilter) || 
          (altAbbr && normalizeAbbr(altAbbr).includes(normalizedFilter));
  }
  
  // Process each category
  for (const [categoryKey, data] of Object.entries(abbreviationsData)) {
    if (category !== 'all' && category !== categoryKey) continue;
    
    // Filter the data
    const filteredData = data.filter(item => 
      matchesFilter(item.abbr, item.altAbbr) || 
      item.meaning.toLowerCase().includes(normalizedFilter)
    );
    
    if (filteredData.length === 0) continue;
    found = true;
    
    // Create the category element
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category';
    
    // Map category keys to display names
    const categoryNames = {
      prescription: 'Prescription Filling Directions',
      quantities: 'Quantities and Measurement',
      patient: 'Patient Instructions',
      medications: 'Medications',
      clinical: 'Clinical Conditions',
      dosage: 'Dosage Forms/Vehicles',
      routes: 'Routes of Administration'
    };
    
    // Create the category header
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.textContent = categoryNames[categoryKey];
    categoryElement.appendChild(categoryHeader);
    
    // Create the table
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Create table headers
    const headerRow = document.createElement('tr');
    const abbrHeader = document.createElement('th');
    abbrHeader.textContent = 'Abbreviation';
    const meaningHeader = document.createElement('th');
    meaningHeader.textContent = 'Meaning';
    
    headerRow.appendChild(abbrHeader);
    headerRow.appendChild(meaningHeader);
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Add the data rows
    filteredData.forEach(item => {
      const row = document.createElement('tr');
      
      // Abbreviation cell
      const abbrCell = document.createElement('td');
      let abbrText = item.abbr;
      if (item.altAbbr) {
        abbrText += ' or ' + item.altAbbr;
      }
      
      // Highlight matching text if filtering
      if (filter) {
        const regex = new RegExp(`(${escapeRegExp(normalizedFilter)})`, 'gi');
        abbrText = normalizeAbbr(abbrText).replace(regex, '<span class="highlight">$1</span>');
      }
      
      abbrCell.innerHTML = abbrText;
      row.appendChild(abbrCell);
      
      // Meaning cell
      const meaningCell = document.createElement('td');
      let meaningText = item.meaning;
      
      // Highlight matching text if filtering
      if (filter && item.meaning.toLowerCase().includes(normalizedFilter)) {
        const regex = new RegExp(`(${escapeRegExp(normalizedFilter)})`, 'gi');
        meaningText = meaningText.replace(regex, '<span class="highlight">$1</span>');
      }
      
      meaningCell.innerHTML = meaningText;
      row.appendChild(meaningCell);
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    categoryElement.appendChild(table);
    container.appendChild(categoryElement);
  }
  
  // If no results found
  if (!found) {
    const noResults = document.createElement('div');
    noResults.className = 'no-results';
    noResults.innerHTML = `No results found for "<span class="highlight">${filter}</span>"`;
    container.appendChild(noResults);
  }
}

// Escape special characters for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('search-btn').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input').value.trim();
    const activeCategoryBtn = document.querySelector('.category-btn.active');
    const category = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'all';
    generateTables(searchInput, category);
  });
  
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const searchInput = document.getElementById('search-input').value.trim();
      const activeCategoryBtn = document.querySelector('.category-btn.active');
      const category = activeCategoryBtn ? activeCategoryBtn.dataset.category : 'all';
      generateTables(searchInput, category);
    }
  });
  
  document.getElementById('reset-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector('[data-category="all"]').classList.add('active');
    generateTables();
  });
  
  // Category filter buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      
      const searchInput = document.getElementById('search-input').value.trim();
      generateTables(searchInput, btn.dataset.category);
    });
  });
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  fetchAbbreviations();
  setupEventListeners();
});