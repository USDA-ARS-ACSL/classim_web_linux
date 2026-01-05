import React from 'react'
import { Box } from '@chakra-ui/react'

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('Email') as string
    if (email) {
      // You can implement the actual newsletter signup logic here
      console.log('Newsletter signup for:', email)
      // For now, we'll redirect to the ARS website
      window.open('https://www.ars.usda.gov/', '_blank')
    }
  }

  return (
    <Box as="footer" className="usa-footer usa-footer-big" role="contentinfo">
      {/* Top footer navigation */}
      <div className="usa-grid-full usa-color-gray-light">
        <nav className="usa-footer-nav usa-width-two-thirds" id="footer-top">
          <ul className="usa-unstyled-list">
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a className="usa-footer-primary-link" href="https://www.ars.usda.gov/research/">Research</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a className="usa-footer-primary-link" href="https://www.ars.usda.gov/research/news-events/news-events/">Media</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a className="usa-footer-primary-link" href="https://www.ars.usda.gov/about-ars/">About ARS</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a className="usa-footer-primary-link" href="https://www.ars.usda.gov/work-with-us/">Work With Us</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Middle footer */}
      <div className="usa-grid-full usa-color-gray-dark">
        {/* Connect with ARS */}
        <nav className="usa-footer-nav usa-width-one-half">
          <h3 className="usa-sign_up-header">Connect with ARS</h3>
          <div className="usa-footer-nav" id="socialLink">
            <a href="https://twitter.com/usda_ars" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.ars.usda.gov/ARSUserFiles/00000000/images/social_media///Twitter-Icon.png" 
                alt="Twitter"
                title="Follow ARS on Twitter"
              />
            </a>
            <a href="https://www.usda.gov/news-events/e-mail-news-lists/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.ars.usda.gov/ARSUserFiles/00000000/images/social_media///Email-Icon.png" 
                title="Email Lists" 
                alt="Email Lists" 
              />
            </a>
            <a href="https://agresearchmag.ars.usda.gov" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.ars.usda.gov/ARSUserFiles/00000000/images/social_media///Magazine-Icon.png" 
                title="Agriculture Research Magazine" 
                alt="Agriculture Research Magazine" 
              />
            </a>
            <a href="https://www.ars.usda.gov/oc/podcasts/index/" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.ars.usda.gov/ARSUserFiles/00000000/images/social_media///Headphone-Icon.png" 
                title="ARS Podcasts" 
                alt="ARS Podcasts" 
              />
            </a>
            
            {/* Note: Removed AddThis script for React compatibility */}
            <a href="https://www.addthis.com/bookmark.php" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://www.ars.usda.gov/ARSUserFiles/00000000/images/social_media/Add-This-Icon.png" 
                alt="Bookmark This Page"
                title="Share This Page"
              />
            </a>
          </div>
        </nav>

        {/* Sign up for ARS News updates */}
        <div className="usa-sign_up-block usa-width-one-half">
          <form onSubmit={handleNewsletterSubmit}>
            <h3 className="usa-sign_up-header">Sign up</h3>
            <div className="EmailSignup-Footer">
              <input 
                id="Email" 
                name="Email" 
                placeholder="Sign up for ARS News updates" 
                type="email" 
                required
              />
              <input 
                name="commit" 
                type="submit" 
                className="usa-color-primary" 
                id="go" 
                value="Go" 
              />
            </div>
            <input id="ListName" name="ListName" type="hidden" value="arsnews" />
            <input id="Action" name="Action" type="hidden" value="Subscribe" />
          </form>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="usa-grid-full usa-color-gray-dark">
        <nav className="usa-footer-nav" id="footer-bottom">
          <ul className="usa-unstyled-list">
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.ars.usda.gov/">ARS Home</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/">USDA.gov</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/plain-writing">Plain Writing</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/policies-and-links">Policies &amp; Links</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.ars.usda.gov/contact-us/">Contact Us</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.ars.usda.gov/research/freedom-of-information-act-and-privacy-act-reference-guide/">FOIA</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/accessibility-statement">Accessibility Statement</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/privacy-policy">Privacy Policy</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/non-discrimination-statement">Non-Discrimination Statement</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usda.gov/docs/quality-of-information/">Quality of Information</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.usa.gov" target="_blank" rel="noopener noreferrer">USA.gov</a>
            </li>
            <li className="usa-width-one-fourth usa-footer-primary-content">
              <a href="https://www.whitehouse.gov" target="_blank" rel="noopener noreferrer">White House</a>
            </li>
          </ul>
        </nav>
      </div>
    </Box>
  )
}

export default Footer