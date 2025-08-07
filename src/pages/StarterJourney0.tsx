/* STARTER USER ROLE SELECTION & PATIENCE LEVEL AT MOMENT, ROLES: EVENT-PLANNER or VENDOR or ARTIST or FREE USER*/

import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useCloudStore } from '../store/cloudStore'

export function StarterJourney0() {
  const navigate = useNavigate()
  const { user } = useCloudStore()
  const [timeRemaining, setTimeRemaining] = useState(60) // 60 seconds timeout
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)
  const [currentTab, setCurrentTab] = useState(1) // 1, 2, or 3
  const [showTab2Failure, setShowTab2Failure] = useState(false)
  const [showTab3Failure, setShowTab3Failure] = useState(false)
  const [showTab3Warning, setShowTab3Warning] = useState(false)
  
  // Terms Acceptance State
  const [initials, setInitials] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsSubmitted, setTermsSubmitted] = useState(false)
  const [showBetaOpportunity, setShowBetaOpportunity] = useState(false)

  // Function to get user's IP address
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error getting IP address:', error)
      return null
    }
  }

  // Function to get user's location from IP
  const getUserLocation = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`)
      const data = await response.json()
      return `${data.country_name || 'Unknown'}, ${data.city || 'Unknown'}`
    } catch (error) {
      console.error('Error getting location:', error)
      return 'Unknown'
    }
  }

  // Function to save terms acceptance to database
  const saveTermsAcceptance = async () => {
    if (!user || !initials.trim()) {
      console.error('No user or initials provided')
      return false
    }

    try {
      setIsSubmitting(true)
      
      // Get user's IP address
      const ipAddress = await getUserIP()
      
      // Get user's location
      const location = ipAddress ? await getUserLocation(ipAddress) : 'Unknown'
      
      // Get user agent
      const userAgent = navigator.userAgent

      console.log('Saving terms acceptance:', {
        userId: user.id,
        initials: initials.trim(),
        ipAddress,
        location,
        userAgent
      })

      // Update participant with terms acceptance data
      const { error } = await supabase
        .from('participants')
        .update({
          terms_accepted: initials.trim(),
          terms_accepted_at: new Date().toISOString(),
          terms_accepted_ip: ipAddress,
          terms_accepted_location: location,
          terms_accepted_user_agent: userAgent,
          modified_by: user.id
        })
        .eq('eventria_user_id', user.id)

      if (error) {
        console.error('Error saving terms acceptance:', error)
        return false
      }

      console.log('Terms acceptance saved successfully')
      return true
    } catch (error) {
      console.error('Error saving terms acceptance:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to update social cred rating
  const updateSocialCred = async (newRating: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from('participants')
        .update({
          social_cred_rating: newRating,
          modified_by: user.id
        })
        .eq('eventria_user_id', user.id)

      if (error) {
        console.error('Error updating social cred:', error)
        return false
      }

      console.log('Social cred updated successfully')
      return true
    } catch (error) {
      console.error('Error updating social cred:', error)
      return false
    }
  }

  // Handle terms submission
  const handleTermsSubmit = async () => {
    if (!initials.trim()) {
      alert('Please enter your initials')
      return
    }

    const success = await saveTermsAcceptance()
    if (success) {
      setTermsSubmitted(true)
      setShowBetaOpportunity(true)
    } else {
      alert('Failed to save terms acceptance. Please try again.')
    }
  }

  // Handle Beta Tester choice
  const handleBetaChoice = async (choice: 'pump' | 'decred') => {
    if (choice === 'pump') {
      // Navigate to StarterJourney1
      navigate('/starter-journey-1')
    } else {
      // Update social cred to -2.336 and navigate to search-chat
      const success = await updateSocialCred('-2.336')
      if (success) {
        navigate('/search-chat')
      } else {
        alert('Failed to update social cred. Please try again.')
      }
    }
  }

  // Dynamic titles based on current tab
  const getTabTitle = (tabNumber: number) => {
    return `askbender Agreement ${tabNumber} of n where n is dependent on your attitude and ability to follow orders without food or rest.`
  }

  // Tab content based on current tab
  const getTabContent = (tabNumber: number) => {
    switch (tabNumber) {
      case 1:
        return {
          title: getTabTitle(1),
          content: (
            <div style={{
              fontSize: '13px',
              color: '#000',
              lineHeight: '1.6'
            }}>
              <p style={{ marginBottom: '16px' }}>
                By entering your initials below and checking the acceptance box, and solving the acceptance captcha, and passing any other arbitrary acceptance roadblocks ahead on AskBender.com, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              
              <p style={{ marginBottom: '16px' }}>
                We've been advised by counsel to add this clause: "Enter at your own risk. Turn around now if you are generally soft and cry easily, or if pregnant. You have been warned. No emergency exit. Doors open at Noon for matinees, but do NOT bring the kids".
              </p>
              
              {!termsSubmitted ? (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      marginBottom: '8px',
                      color: '#000'
                    }}>
                      Enter Your Initials:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., JS"
                      value={initials}
                      onChange={(e) => setInitials(e.target.value.toUpperCase())}
                      style={{
                        width: '100px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontFamily: 'Poppins, sans-serif',
                        textTransform: 'uppercase'
                      }}
                      maxLength={10}
                    />
                  </div>
                  
                  <button
                    onClick={handleTermsSubmit}
                    disabled={isSubmitting || !initials.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '24px' }}>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '6px',
                    color: '#155724',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    ✅ SUCCESS! Terms Accepted
                  </div>
                  
                  {showBetaOpportunity && (
                    <div style={{
                      padding: '20px',
                      backgroundColor: '#fff3cd',
                      border: '2px solid #ffeaa7',
                      borderRadius: '8px',
                      marginTop: '20px'
                    }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#856404',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                      }}>
                        While we are in Beta, you have the opportunity to be a Master-Beta Testers, and increase your Social Cred without being a Canadian. Your Cred is ZERO and we prefer it that way but you can cheat the system, just like I did when you gave me your email and I added you to the IRS priority review list. I'm an affiliate. They don't know they have an affiliate program. Getting paid!
                      </p>
                      
                      <p style={{
                        fontSize: '14px',
                        color: '#856404',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                      }}>
                        But seriouly, right now, you have a one-time chance to pump your Social Cred like what's-her-names' boobies - 🙊. You up for this, or you want to start your Social Cred at -2.336? It just dropped bc we had to ASK.
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <button
                          onClick={() => handleBetaChoice('pump')}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          PLEASE PUMP ME. I MEAN IT. UP
                        </button>
                        
                        <button
                          onClick={() => handleBetaChoice('decred')}
                          style={{
                            padding: '12px 20px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            fontFamily: 'Poppins, sans-serif'
                          }}
                        >
                          DE-BANK. I MEAN DE-CRED ME
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        }
      case 2:
        return {
          title: "askbendor agreement 1 of n, the easy way",
          content: (
            <div style={{
              fontSize: '13px',
              color: '#000',
              lineHeight: '1.6'
            }}>
              <p style={{ marginBottom: '16px' }}>
                By simply checking simple acceptance checkboxes below I will prove my superiotrity over acceptance forms this time for sure. Put me in coach!
              </p>
              
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  [Checkbox form will be added here]
                </p>
              </div>
            </div>
          )
        }
      case 3:
        return {
          title: "askBender agreement - kindergarten mode enabled",
          content: (
            <div style={{
              fontSize: '13px',
              color: '#000',
              lineHeight: '1.6'
            }}>
              <p style={{ marginBottom: '16px' }}>
                See the YELLOW BOX below? No? Look Down from here. Inside that box, at the very bottom is chocolate. Yes, real chocoloate. Just scrolllllll to the verrrrry bottom of that yellow box, and get your chocolate. GO KID! GO!"
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div 
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    if (el) {
                      el.style.scrollbarWidth = 'none';
                      el.style.setProperty('--scrollbar-width', 'none');
                    }
                  }}
                  onScroll={(e) => {
                    const target = e.target as HTMLDivElement;
                    clearTimeout((target as any).scrollTimeout);
                    (target as any).scrollTimeout = setTimeout(() => {
                                          // Only jump back to top if user has scrolled more than 2 screens (600px)
                    if (target.scrollTop > 600) {
                      target.scrollTop = 0;
                    }
                    }, 100);
                  }}
                  style={{
                    width: '100px',
                    height: '300px',
                    border: '1px solid #ccc',
                    overflow: 'auto',
                    fontSize: '12px',
                    lineHeight: '1.2',
                    padding: '8px',
                    backgroundColor: '#ffff00',
                    scrollbarWidth: 'none'
                  }}
                >
                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }}>TERMS AND CONDITIONS</div>
                
                {/* How to get Chocolate section */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>How to get Chocolate 🍫</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Scroll down to the very bottom of this box. That's all you need to do. No, not the Top, the Bottom. It's the part BELOW here. You got it. No, I'm not in space without an up or down. Yes, I am in space, but articifical gravity. Gravity is what makes your poop FALL from your butt. Into your pants. So yes, Mommy hates Gravity.
                  </p>
                </div>
                
                {/* First copy of terms */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Acceptance of Terms</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    By accessing and using AskBender, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Use License</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Permission is granted to temporarily download one copy of the materials on AskBender's website for personal, non-commercial transitory viewing only.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Disclaimer</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    The materials on AskBender's website are provided on an 'as is' basis. AskBender makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Limitations</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    In no event shall AskBender or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AskBender's website.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Revisions and Errata</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    The materials appearing on AskBender's website could include technical, typographical, or photographic errors. AskBender does not warrant that any of the materials on its website are accurate, complete or current.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Links</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    AskBender has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AskBender of the site.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Contact Information</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    If you have any questions about these Terms of Use, please contact us at terms@bendersaas.ai
                  </p>
                </div>
                
                {/* Second copy of terms */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Acceptance of Terms</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    By accessing and using AskBender, you accept and agree to be bound by the terms and provision of this agreement.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Use License</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    Permission is granted to temporarily download one copy of the materials on AskBender's website for personal, non-commercial transitory viewing only.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Disclaimer</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    The materials on AskBender's website are provided on an 'as is' basis. AskBender makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Limitations</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    In no event shall AskBender or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AskBender's website.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Revisions and Errata</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    The materials appearing on AskBender's website could include technical, typographical, or photographic errors. AskBender does not warrant that any of the materials on its website are accurate, complete or current.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Links</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    AskBender has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AskBender of the site.
                  </p>
                  
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Contact Information</h3>
                  <p style={{ fontSize: '12px', marginBottom: '8px' }}>
                    If you have any questions about these Terms of Use, please contact us at terms@bendersaas.ai
                  </p>
                </div>
                
                {/* Greek text continues */}
                <div style={{ marginTop: '16px' }}>
                  {Array.from({ length: 50 }, (_, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      {`${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`}
                    </div>
                  ))}
                  <div style={{ 
                    fontWeight: 'bold', 
                    color: '#dc3545', 
                    marginTop: '16px',
                    fontSize: '12px'
                  }}>
                    ACCEPTANCE SIGNATURE REQUIRED AT BOTTOM
                  </div>
                  <div style={{ 
                    marginTop: '16px',
                    fontSize: '24px',
                    textAlign: 'center'
                  }}>
                    🍫🍫🍫🍫🍫🍫🍫🍫🍫🍫
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tab 3 Warning Message */}
            {showTab3Warning && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px'
              }}>
                <div style={{
                  border: '2px solid #dc3545',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: '#fff',
                  maxWidth: '400px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    color: '#dc3545',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    marginBottom: '8px'
                  }}>
                    WARNING:
                  </div>
                  <div style={{
                    color: '#dc3545',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    <div>IF YOU DON'T GET IT.</div>
                    <div>THE CHOCOLATE WILL MELT.</div>
                    <div>INSIDE THE COMPUTER.</div>
                    <div>AND YOUR MOM'S GONNA GET REALLY MAD.</div>
                  </div>
                </div>
              </div>
            )}
            </div>
          )
        }
      default:
        return {
          title: getTabTitle(1),
          content: <div>Error: Invalid tab</div>
        }
    }
  }

  // Timeout countdown
  useEffect(() => {
    if (timeRemaining > 0 && !showTimeoutMessage) {
      // Speed up timer after 30 seconds
      const interval = timeRemaining <= 30 ? 500 : 1000 // 500ms when <= 30 seconds, 1000ms otherwise
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, interval)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && !showTimeoutMessage) {
      // Show timeout message based on current tab
      if (currentTab === 2) {
        setShowTab2Failure(true)
      } else if (currentTab === 3) {
        // Tab 3 timeout - show failure popup
        setShowTab3Failure(true)
      } else {
        setShowTimeoutMessage(true)
      }
    }
  }, [timeRemaining, showTimeoutMessage, navigate])

  // Tab 3 warning at 25 seconds
  useEffect(() => {
    if (currentTab === 3 && timeRemaining === 25) {
      setShowTab3Warning(true)
    }
  }, [currentTab, timeRemaining])

  // Auto-progress popup timeout
  useEffect(() => {
    if (showTimeoutMessage) {
      const popupTimer = setTimeout(() => {
        setShowTimeoutMessage(false)
        setCurrentTab(2)
        setTimeRemaining(60)
      }, 7000) // 7 seconds timeout
      return () => clearTimeout(popupTimer)
    }
  }, [showTimeoutMessage])

  // Auto-progress Tab 2 failure popup timeout
  useEffect(() => {
    if (showTab2Failure) {
      const popupTimer = setTimeout(() => {
        setShowTab2Failure(false)
        setCurrentTab(3)
        setTimeRemaining(60)
      }, 7000) // 7 seconds timeout
      return () => clearTimeout(popupTimer)
    }
  }, [showTab2Failure])

  const handleTabChange = (newTab: number) => {
    setCurrentTab(newTab)
    // Reset timer for new tab
    setTimeRemaining(60)
    setShowTimeoutMessage(false)
    setShowTab3Warning(false)
    setShowTab2Failure(false)
  }

  const currentTabData = getTabContent(currentTab)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'white',
      fontFamily: 'Poppins, sans-serif'
    }}>
      {/* Header with Logo */}
      <header style={{
        padding: '20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center'
      }}>
        <img
          src="/askbender_b!_green_on_blk.png"
          alt="AskBender"
          style={{
            height: '40px',
            width: 'auto',
            cursor: 'pointer',
            objectFit: 'contain'
          }}
          onClick={() => window.history.back()}
        />
      </header>

      {/* Progress Bar */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '650px',
          margin: '0 auto'
        }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((stepNumber) => (
            <div key={stepNumber} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}>
              {/* Step Circle */}
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: (stepNumber === 1 && currentTab === 1) || (stepNumber === 2 && currentTab === 2) || (stepNumber === 3 && currentTab === 3) ? '2px solid #000' : (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? 'none' : '2px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                fontFamily: 'Poppins, sans-serif',
                backgroundColor: (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? '#dc3545' : 'transparent',
                color: (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? '#fff' : (stepNumber === currentTab ? '#000' : '#ccc'),
                marginBottom: '8px'
              }}>
                {(stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? 'X' : stepNumber}
              </div>
              
              {/* Step Status */}
              <div style={{
                fontSize: (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? '11px' : '10px',
                color: (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? '#dc3545' : '#ccc',
                textAlign: 'center',
                fontWeight: (stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? 'bold' : 'normal'
              }}>
                                  {(stepNumber === 1 && currentTab >= 2) || (stepNumber === 2 && (showTab2Failure || (currentTab === 2 && timeRemaining === 0) || currentTab >= 3)) || (stepNumber === 3 && showTab3Failure) ? 'FAIL' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Tab Navigation */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px'
      }}>
        {[1, 2, 3].map((tabNumber) => (
          <button
            key={tabNumber}
            onClick={() => handleTabChange(tabNumber)}
            style={{
              background: 'transparent',
              border: 'none',
              color: currentTab === tabNumber ? '#000' : '#ccc',
              fontSize: '12px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '4px',
              transition: 'color 0.2s ease'
            }}
          >
            Tab {tabNumber}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#dc3545',
          border: '2px solid #dc3545',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#ffffff'
        }}>
          Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Main Content */}
      <main style={{
        maxWidth: '650px',
        margin: '0 auto',
        padding: '40px 25px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '22px',
          fontWeight: '700',
          color: '#000',
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '32px'
        }}>
          {currentTabData.title}
        </h1>

        {/* Tab 2 Failure Popup Overlay */}
        {showTab2Failure && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc3545',
                marginBottom: '24px'
              }}>
                0 for 2. Is it me or you?
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => {
                    setShowTab2Failure(false)
                    setCurrentTab(3)
                    setTimeRemaining(60)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  ME
                </button>
                <button
                  onClick={() => {
                    setShowTab2Failure(false)
                    setCurrentTab(3)
                    setTimeRemaining(60)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  MYSELF
                </button>
                <button
                  onClick={() => {
                    setShowTab2Failure(false)
                    setCurrentTab(3)
                    setTimeRemaining(60)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  AND I
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timeout Popup Overlay */}
        {showTimeoutMessage && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc3545',
                marginBottom: '24px'
              }}>
                Fail!
              </div>
                                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px'
                  }}>
                    <button
                      onClick={() => {
                        setCurrentTab(2)
                        setTimeRemaining(60)
                        setShowTimeoutMessage(false)
                      }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  MY
                </button>
                <button
                  onClick={() => {
                    setCurrentTab(2)
                    setTimeRemaining(60)
                    setShowTimeoutMessage(false)
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  BAD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3 Failure Popup Overlay */}
        {showTab3Failure && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc3545',
                marginBottom: '24px'
              }}>
                Maybe try Leggos kid
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => {
                    setShowTab3Failure(false)
                    navigate('/starter-journey-2')
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  KEEP GOING
                </button>
                <button
                  onClick={() => {
                    setShowTab3Failure(false)
                    navigate('/starter-journey-3')
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    minWidth: '80px'
                  }}
                >
                  ABORT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {currentTabData.content}
      </main>
    </div>
  )
} 