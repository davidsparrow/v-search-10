import { useState } from 'react'
import { Button, Switch } from 'antd'
import { FaSearch } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useCloudStore } from '../../store/cloudStore'
import { TierGate } from '../TierGate'
import { AskBenderTier } from '../../types/askbender'

interface SearchMenuTemplateProps {
  isVisible: boolean
  onClose: () => void
  userLevel?: AskBenderTier
  eventriaTier?: string
  onApplyFilters?: (filters: any) => void
}

export function SearchMenuTemplate({ 
  isVisible, 
  onClose, 
  userLevel = 'fresh_meat',
  eventriaTier,
  onApplyFilters
}: SearchMenuTemplateProps) {
  const navigate = useNavigate()
  const { getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()
  
  // Filter states
  const [searchValue, setSearchValue] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [excludeLoafers, setExcludeLoafers] = useState(false)
  const [fourStars, setFourStars] = useState(false)
  const [genre, setGenre] = useState('')
  const [hasPortablePower, setHasPortablePower] = useState(false)
  const [isUnionCompliant, setIsUnionCompliant] = useState(false)
  const [requiresDeposit, setRequiresDeposit] = useState(false)
  const [driveMiles, setDriveMiles] = useState('')
  const [cancellationFee, setCancellationFee] = useState('')
  const [minInitialDeposit, setMinInitialDeposit] = useState('')
  const [minTotalDeposit, setMinTotalDeposit] = useState('')
  const [allowsMilestoneDeposits, setAllowsMilestoneDeposits] = useState(false)
  
  const stateOptions = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC','PR'
  ]

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop for outside click */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'transparent',
          zIndex: 999
        }}
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '350px',
          height: '100vh',
          background: 'white',
          zIndex: 1000,
          animation: 'slideInRight 0.4s ease-out',
          padding: '24px',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Apply button and X */}
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '32px' }}>
          <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
            <Button
              type="primary"
              disabled={!searchValue && !city && !state && !country && !excludeLoafers && !fourStars && !genre && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !driveMiles && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits}
              onClick={() => {
                // Call onApplyFilters if provided
                if (onApplyFilters) {
                  onApplyFilters({
                    searchValue,
                    city,
                    state,
                    country,
                    excludeLoafers,
                    fourStars,
                    genre,
                    hasPortablePower,
                    isUnionCompliant,
                    requiresDeposit,
                    driveMiles,
                    cancellationFee,
                    minInitialDeposit,
                    minTotalDeposit,
                    allowsMilestoneDeposits
                  })
                }
                
                // Close the menu after applying
                onClose()
                
                // Redirect to search page
                navigate('/search')
                console.log('Apply filters clicked')
              }}
              style={{
                minWidth: '90px',
                height: '40px',
                fontSize: '14px',
                fontWeight: 'normal',
                borderRadius: '88px',
                background: (searchValue || city || state || country || excludeLoafers || fourStars || genre || hasPortablePower || isUnionCompliant || requiresDeposit || driveMiles || cancellationFee || minInitialDeposit || minTotalDeposit || allowsMilestoneDeposits) ? '#1890ff' : '#d9d9d9',
                borderColor: (searchValue || city || state || country || excludeLoafers || fourStars || genre || hasPortablePower || isUnionCompliant || requiresDeposit || driveMiles || cancellationFee || minInitialDeposit || minTotalDeposit || allowsMilestoneDeposits) ? '#1890ff' : '#d9d9d9',
                color: 'white',
                boxShadow: 'none',
                outline: 'none',
                transition: 'all 0.2s ease',
                cursor: (searchValue || city || state || country || excludeLoafers || fourStars || genre || hasPortablePower || isUnionCompliant || requiresDeposit || driveMiles || cancellationFee || minInitialDeposit || minTotalDeposit || allowsMilestoneDeposits) ? 'pointer' : 'not-allowed'
              }}
            >
              Apply
            </Button>
            <Button
              type="primary"
              disabled={!searchValue && !city && !state && !country && !excludeLoafers && !fourStars && !genre && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !driveMiles && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits}
              onClick={() => {
                setSearchValue('')
                setCity('')
                setState('')
                setCountry('')
                setExcludeLoafers(false)
                setFourStars(false)
                setGenre('')
                setHasPortablePower(false)
                setIsUnionCompliant(false)
                setRequiresDeposit(false)
                setDriveMiles('')
                setCancellationFee('')
                setMinInitialDeposit('')
                setMinTotalDeposit('')
                setAllowsMilestoneDeposits(false)
                console.log('Clear all filters clicked')
              }}
              style={{
                minWidth: '90px',
                height: '40px',
                fontSize: '14px',
                fontWeight: 'normal',
                borderRadius: '88px',
                background: (!searchValue && !city && !state && !country && !excludeLoafers && !fourStars && !genre && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !driveMiles && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? '#fecaca' : '#DC2626',
                borderColor: (!searchValue && !city && !state && !country && !excludeLoafers && !fourStars && !genre && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !driveMiles && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? '#fecaca' : '#DC2626',
                color: 'white',
                boxShadow: 'none',
                outline: 'none',
                transition: 'all 0.2s ease',
                cursor: (!searchValue && !city && !state && !country && !excludeLoafers && !fourStars && !genre && !hasPortablePower && !isUnionCompliant && !requiresDeposit && !driveMiles && !cancellationFee && !minInitialDeposit && !minTotalDeposit && !allowsMilestoneDeposits) ? 'not-allowed' : 'pointer'
              }}
            >
              Clear
            </Button>
          </div>
          <Button
            type="text"
            onClick={onClose}
            style={{ color: '#333', fontSize: '20px', background: 'none', border: 'none', boxShadow: 'none', outline: 'none', cursor: 'pointer' }}
            aria-label="Close menu"
          >
            ✕
          </Button>
        </div>

        {/* FIRST ITEM: Keyword Search */}
        <div style={{ marginBottom: '2px', position: 'relative', border: 'none', background: 'transparent' }}>
          <span style={{
            position: 'absolute',
            left: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#888',
            fontSize: '22px',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            <FaSearch />
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Fun band, Jumpy House, Donut Machine..."
            className="apple-search-input"
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '36px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#222',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              transition: 'border 0.2s'
            }}
            autoComplete="off"
          />
        </div>

        {/* SECOND ITEM: City and State Fields */}
        <div style={{ display: 'flex', flexDirection: 'row', gap: '4px', marginBottom: '2px' }}>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="City"
            className="apple-search-input"
            style={{
              flex: 1,
              height: '48px',
              paddingLeft: '36px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: '#222',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              transition: 'border 0.2s'
            }}
            autoComplete="off"
          />
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={state}
              onChange={e => setState(e.target.value)}
              className="apple-search-input"
              style={{
                width: '100%',
                height: '48px',
                paddingLeft: '36px',
                paddingRight: '32px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                color: state ? '#222' : '#888',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                appearance: 'none',
                transition: 'border 0.2s',
                cursor: 'pointer',
                textAlign: 'left',
                textAlignLast: 'left'
              }}
            >
              <option value="" disabled hidden>State</option>
              {stateOptions.map(opt => (
                <option key={opt} value={opt} style={{ color: '#222', background: '#fff', textAlign: 'left' }}>{opt}</option>
              ))}
            </select>
            {state ? (
              <button
                onClick={() => setState('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '0',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            ) : (
              <span
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#888',
                  fontSize: '12px',
                  pointerEvents: 'none'
                }}
              >
                ▼
              </span>
            )}
          </div>
        </div>

        {/* THIRD ITEM: Country Field */}
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="apple-search-input"
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '36px',
              paddingRight: '32px',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 400,
              color: country ? '#222' : '#888',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              appearance: 'none',
              transition: 'border 0.2s',
              cursor: 'pointer',
              textAlign: 'left',
              textAlignLast: 'left'
            }}
          >
            <option value="" disabled hidden>Country</option>
            <option value="USA" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>USA</option>
            <option value="Canada" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Canada</option>
            <option value="Mexico" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Mexico</option>
          </select>
          {country ? (
            <button
              onClick={() => setCountry('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '0',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          ) : (
            <span
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                fontSize: '12px',
                pointerEvents: 'none'
              }}
            >
              ▼
            </span>
          )}
        </div>

        {/* FOURTH ITEM: FREE FILTERS */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <Switch
              size="small"
              checked={excludeLoafers}
              onChange={setExcludeLoafers}
              style={{ marginRight: '8px' }}
              className="custom-switch"
            />
            <span style={{
              color: excludeLoafers ? '#222' : '#888',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              transition: 'color 0.2s'
            }}>
              Trusted Vendors
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <Switch
              size="small"
              checked={fourStars}
              onChange={setFourStars}
              style={{ marginRight: '8px' }}
              className="custom-switch"
            />
            <span style={{
              color: fourStars ? '#222' : '#888',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '13px',
              transition: 'color 0.2s'
            }}>
              4 stars or higher
            </span>
          </div>
        </div>

        {/* FIFTH ITEM: PAID FILTERS */}
        <TierGate 
          feature="advanced_analytics" 
          userTier={userLevel} 
          eventriaTier={eventriaTier}
          showUpgradeButton={false}
          customMessage="This feature isn't for timid little scaredy-cats who can't afford it either."
          showCustomMessage={true}
          onClearValues={() => {
            // Clear all PAID filter values
            setGenre('')
            setDriveMiles('')
            setCancellationFee('')
            setMinInitialDeposit('')
            setMinTotalDeposit('')
            setAllowsMilestoneDeposits(false)
            setHasPortablePower(false)
            setIsUnionCompliant(false)
            setRequiresDeposit(false)
            
            // Force a small delay to ensure state updates properly
            setTimeout(() => {
              setAllowsMilestoneDeposits(false)
              setHasPortablePower(false)
              setIsUnionCompliant(false)
              setRequiresDeposit(false)
            }, 10)
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            {/* Genre Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: genre ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Genre or Ethnicity:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: genre ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="rock" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Rock</option>
                  <option value="jazz" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Jazz</option>
                  <option value="pop" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Pop</option>
                  <option value="country" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Country</option>
                  <option value="classical" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>Classical</option>
                </select>
                {genre ? (
                  <button
                    onClick={() => setGenre('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Can Drive Miles Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: driveMiles ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Max Driving Distance:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={driveMiles}
                  onChange={e => setDriveMiles(e.target.value)}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: driveMiles ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="5" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>5 miles</option>
                  <option value="10" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>10 miles</option>
                  <option value="15" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>15 miles</option>
                  <option value="20" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>20 miles</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30 miles</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40 miles</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50 miles</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75 miles</option>
                  <option value="100" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>100 miles</option>
                  <option value="125" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>125 miles</option>
                  <option value="150" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>150 miles</option>
                </select>
                {driveMiles ? (
                  <button
                    onClick={() => setDriveMiles('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Min Days Deposit Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: cancellationFee ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Min Days Deposit due before Event:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={cancellationFee}
                  onChange={e => setCancellationFee(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [0, 7, 14, 21, 30, 45, 60, 75, 90]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
                        )
                        setCancellationFee(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: cancellationFee ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="0" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>0 days</option>
                  <option value="7" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>7 days</option>
                  <option value="14" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>14 days</option>
                  <option value="21" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>21 days</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30 days</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45 days</option>
                  <option value="60" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>60 days</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75 days</option>
                  <option value="90" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>90 days</option>
                </select>
                {cancellationFee ? (
                  <button
                    onClick={() => setCancellationFee('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Min Initial Deposit Amount Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: minInitialDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Minimum Initial Deposit Amount:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={minInitialDeposit}
                  onChange={e => setMinInitialDeposit(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [10, 15, 20, 25, 30, 35, 40, 45, 50]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num * 10) < Math.abs(prev - num * 10) ? curr : prev
                        )
                        setMinInitialDeposit(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: minInitialDeposit ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="10" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>10%</option>
                  <option value="15" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>15%</option>
                  <option value="20" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>20%</option>
                  <option value="25" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>25%</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30%</option>
                  <option value="35" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>35%</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40%</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45%</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50%</option>
                </select>
                {minInitialDeposit ? (
                  <button
                    onClick={() => setMinInitialDeposit('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Min Total Deposit Amount Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{
                color: minTotalDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                marginRight: '12px',
                flex: 1,
                transition: 'color 0.2s'
              }}>
                Minimum Total Deposit Amount:
              </span>
              <div style={{ position: 'relative', width: '120px' }}>
                <select
                  value={minTotalDeposit}
                  onChange={e => setMinTotalDeposit(e.target.value)}
                  onKeyDown={(e) => {
                    // Allow typing numbers for quick navigation
                    if (e.key >= '0' && e.key <= '9') {
                      const num = parseInt(e.key)
                      if (num >= 0 && num <= 9) {
                        // Find closest option to typed number
                        const options = [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
                        const closest = options.reduce((prev, curr) => 
                          Math.abs(curr - num * 10) < Math.abs(prev - num * 10) ? curr : prev
                        )
                        setMinTotalDeposit(closest.toString())
                      }
                    }
                  }}
                  className="apple-search-input"
                  style={{
                    width: '100%',
                    height: '48px',
                    paddingLeft: '36px',
                    paddingRight: '32px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    color: minTotalDeposit ? '#222' : '#888',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none',
                    transition: 'border 0.2s',
                    cursor: 'pointer',
                    textAlign: 'left',
                    textAlignLast: 'left'
                  }}
                >
                  <option value="" disabled hidden></option>
                  <option value="25" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>25%</option>
                  <option value="30" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>30%</option>
                  <option value="35" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>35%</option>
                  <option value="40" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>40%</option>
                  <option value="45" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>45%</option>
                  <option value="50" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>50%</option>
                  <option value="55" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>55%</option>
                  <option value="60" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>60%</option>
                  <option value="65" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>65%</option>
                  <option value="70" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>70%</option>
                  <option value="75" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>75%</option>
                  <option value="80" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>80%</option>
                  <option value="85" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>85%</option>
                  <option value="90" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>90%</option>
                  <option value="95" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>95%</option>
                  <option value="100" style={{ color: '#222', background: '#fff', textAlign: 'left' }}>100%</option>
                </select>
                {minTotalDeposit ? (
                  <button
                    onClick={() => setMinTotalDeposit('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '0',
                      width: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    ✕
                  </button>
                ) : (
                  <span
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#888',
                      fontSize: '12px',
                      pointerEvents: 'none'
                    }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </div>

            {/* Additional paid filters */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={hasPortablePower}
                onChange={setHasPortablePower}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: hasPortablePower ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Has portable power source for outdoor event
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={isUnionCompliant}
                onChange={setIsUnionCompliant}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: isUnionCompliant ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Is Union-compliant
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={requiresDeposit}
                onChange={setRequiresDeposit}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: requiresDeposit ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Requires Deposit at least 30 days before event
              </span>
            </div>

            {/* Allows Milestone Deposits Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <Switch
                size="small"
                checked={allowsMilestoneDeposits}
                onChange={setAllowsMilestoneDeposits}
                style={{ marginRight: '8px' }}
                className="custom-switch"
              />
              <span style={{
                color: allowsMilestoneDeposits ? '#222' : '#888',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '13px',
                transition: 'color 0.2s'
              }}>
                Allows Milestone Deposits
              </span>
            </div>
          </div>
        </TierGate>
      </div>
    </>
  )
} 