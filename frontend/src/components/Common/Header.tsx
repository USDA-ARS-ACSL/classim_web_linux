import React, { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'

interface HeaderProps {
  labName?: string
  labLocation?: string
}

const Header: React.FC<HeaderProps> = ({ 
  labName = "Your lab name", 
  labLocation = "Your city, Your State" 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [isBannerExpanded, setIsBannerExpanded] = useState(false)

  useEffect(() => {
    // Initialize USWDS components when the component mounts
    if (typeof window !== 'undefined' && (window as any).USWDS) {
      (window as any).USWDS.init()
    }
  }, [])

  const toggleSubmenu = (menuId: string) => {
    setOpenSubmenu(openSubmenu === menuId ? null : menuId)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const query = formData.get('query') as string
    if (query) {
      const searchUrl = `https://search.usa.gov/search?sort=rel&affiliate=agriculturalresearchservicears&query=${encodeURIComponent(query)}`
      window.open(searchUrl, '_blank')
    }
  }

  return (
    <Box as="header" className="usa-header usa-header-basic" role="banner">
      {/* Gov banner BEGIN */}
      <div className="usa-banner">
        <div className="usa-accordion">
          <header className="usa-banner-header">
            <div className="usa-grid usa-banner-inner">
              <img src="./assets/uswds/img/favicons/favicon-57.png" alt="U.S. flag" />
              <p>An official website of the United States government</p>
              <button 
                className="usa-accordion-button usa-banner-button"
                aria-expanded={isBannerExpanded}
                aria-controls="gov-banner"
                onClick={() => setIsBannerExpanded(!isBannerExpanded)}
              >
                <span className="usa-banner-button-text">Here's how you know</span>
              </button>
            </div>
          </header>
          <div 
            className={`usa-banner-content usa-grid usa-accordion-content ${isBannerExpanded ? 'usa-accordion-content-expanded' : ''}`}
            id="gov-banner"
            aria-hidden={!isBannerExpanded}
          >
            <div className="usa-banner-guidance-gov usa-width-one-half">
              <img className="usa-banner-icon usa-media_block-img" src="./assets/uswds/img/icon-dot-gov.svg" alt="Dot gov" />
              <div className="usa-media_block-body">
                <p>
                  <strong>The .gov means it's official.</strong>
                  <br />
                  Federal government websites always use a .gov or .mil domain. Before sharing sensitive information online, 
                  make sure you're on a .gov or .mil site by inspecting your browser's address (or "location") bar.
                </p>
              </div>
            </div>
            <div className="usa-banner-guidance-ssl usa-width-one-half">
              <img className="usa-banner-icon usa-media_block-img" src="./assets/uswds/img/icon-https.svg" alt="SSL" />
              <div className="usa-media_block-body">
                <p>
                  This site is also protected by an SSL (Secure Sockets Layer) certificate that's been signed by the U.S. government. 
                  The <strong>https://</strong> means all transmitted data is encrypted — in other words, 
                  any information or browsing history that you provide is transmitted securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Gov banner END */}
      
      {/* ARS Website Header Navigation BEGIN */}
      <div className="usa-nav-container">
        {/* ARS Logo and Text BEGIN */}
        <div className="usa-navbar">
          <button 
            className="usa-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            Menu
          </button>
          <div className="usa-logo" id="logo">
            <span className="usda-logo">
              <img src="https://www.ars.usda.gov/images/redesign/USDA-Logo.png" alt="USDA Logo" className="usda-logo-img" />
            </span>
            <em className="usa-logo-text">
              <a href="https://www.usda.gov/" title="Home" aria-label="The U.S. Department of Agriculture Home Page" rel="home">
                United States Department of Agriculture
              </a>
              <h6>
                <a href="https://www.ars.usda.gov/" title="Home" aria-label="The Agricultural Research Service Home Page" rel="home">
                  Agricultural Research Service
                </a>
              </h6>
            </em>
          </div>
        </div>
        {/* ARS Logo and Text END */}
        
        {/* Lab name: city, state BEGIN */}
        <div className="usa-grid-full usa-color-primary">
          <h3 id="LocationHeader">
            {labName}: {labLocation}
          </h3>
        </div>
        {/* Lab name: city, state END */}
        
        {/* ARS Website Header Navigation */}
        <nav role="navigation" className={`usa-nav usa-color-primary-darkest ${isMenuOpen ? 'usa-nav-open' : ''}`}>
          <button 
            className="usa-nav-close"
            onClick={() => setIsMenuOpen(false)}
          >
            <img src="./assets/uswds/img/close.svg" alt="close" />
          </button>
          
          <ul className="usa-nav-primary usa-accordion">
            <li>
              <button 
                className="usa-accordion-button usa-nav-link" 
                aria-expanded={openSubmenu === 'research'}
                aria-controls="side-nav-1"
                onClick={() => toggleSubmenu('research')}
              >
                <span>Research</span>
              </button>
              <ul 
                id="side-nav-1" 
                className={`usa-nav-submenu usa-color-white ${openSubmenu === 'research' ? '' : 'usa-nav-submenu-hidden'}`}
                aria-hidden={openSubmenu !== 'research'}
              >
                <li><a href="https://www.ars.usda.gov/research/programs-projects/?modeCode=xx-xx-xx-xx">Research Projects</a></li>
                <li><a href="https://www.ars.usda.gov/research/publications/publications-at-this-location/?modeCode=xx-xx-xx-xx">Publications</a></li>
                <li><a href="https://www.ars.usda.gov/research/collaborations/?modeCode=xx-xx-xx-xx">Collaborations</a></li>
                <li><a href="https://www.ars.usda.gov/news-events/?modeCode=xx-xx-xx-xx">News</a></li>
              </ul>
            </li>
            
            <li>
              <button 
                className="usa-accordion-button usa-nav-link" 
                aria-expanded={openSubmenu === 'people'}
                aria-controls="side-nav-2"
                onClick={() => toggleSubmenu('people')}
              >
                <span>People</span>
              </button>
              <ul 
                id="side-nav-2" 
                className={`usa-nav-submenu usa-color-white ${openSubmenu === 'people' ? '' : 'usa-nav-submenu-hidden'}`}
                aria-hidden={openSubmenu !== 'people'}
              >
                <li><a href="https://www.ars.usda.gov/people-locations/people-list/?modeCode=xx-xx-xx-xx">Staff Listing</a></li>
                <li><a href="https://www.ars.usda.gov/careers/?modeCode=xx-xx-xx-xx">Careers</a></li>
              </ul>
            </li>
            
            <li>
              <button 
                className="usa-accordion-button usa-nav-link" 
                aria-expanded={openSubmenu === 'custom'}
                aria-controls="side-nav-3"
                onClick={() => toggleSubmenu('custom')}
              >
                <span>Custom multiple links</span>
              </button>
              <ul 
                id="side-nav-3" 
                className={`usa-nav-submenu usa-color-white ${openSubmenu === 'custom' ? '' : 'usa-nav-submenu-hidden'}`}
                aria-hidden={openSubmenu !== 'custom'}
              >
                <li><a href="https://www.ars.usda.gov/about-ars/">About ARS Home</a></li>
                <li><a href="https://www.ars.usda.gov/people-locations/find-a-person/">Staff Directory</a></li>
                <li><a href="https://www.ars.usda.gov/people-locations/find-a-location/">Labs and Research Centers (Map)</a></li>
                <li><a href="https://www.ars.usda.gov/about-ars/headquarters-information/">Headquarter Offices</a></li>
                <li><a href="https://www.ars.usda.gov/people-locations/organizational-chart/">Organizational Chart</a></li>
                <li><a href="https://www.afm.ars.usda.gov/">Employee Services</a></li>
                <li><a href="https://www.ars.usda.gov/office-of-outreach-diversity-and-equal-opportunity/">Office of Outreach, Diversity, and Equal Opportunity</a></li>
              </ul>
            </li>
            
            <li>
              <a href="https://www.ars.usda.gov/about-ars/" className="usa-color-white">
                <span>Custom single link</span>
              </a>
            </li>
          </ul>
          
          <form className="usa-search usa-search-small" method="get" onSubmit={handleSearch}>
            <div role="search">
              <label className="usa-sr-only" htmlFor="search-field-small">Search</label>
              <input id="query" type="search" name="query" />
              <button type="submit">
                <span className="usa-sr-only">Search</span>
              </button>
            </div>
          </form>
          
          {/* Secondary Navigation BEGIN */}
          <div className="usa-nav-secondary" style={{top: '-8.2rem'}}>
            <ul className="usa-unstyled-list usa-nav-secondary-links">
              <li><a title="ARS Home" href="https://www.ars.usda.gov"><b>ARS Home</b></a></li>
              <li><a title="About ARS" href="https://www.ars.usda.gov/about-ars/"><b>About ARS</b></a></li>
              <li><a title="Contact Us" href="https://www.ars.usda.gov/contact-us/?modeCode=xx-xx-xx-xx"><b>Contact Us</b></a></li>
            </ul>
          </div>
          {/* Secondary Navigation END */}
        </nav>
      </div>
      {/* ARS Website Header Navigation END */}
    </Box>
  )
}

export default Header