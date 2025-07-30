import { useCloudStore } from '../../store/cloudStore'

export function MainFooter() {
  const { getThemeConfig } = useCloudStore()
  const theme = getThemeConfig()

  return (
    <div style={{ 
      background: 'transparent',
      padding: 0,
      height: '27px',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ 
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        <div style={{ 
          fontSize: '10px',
          color: theme.textSecondary,
          lineHeight: '17px',
          paddingBottom: '10px'
        }}>
          © 2025 bendersaas.ai all rights reserved
        </div>
      </div>
    </div>
  )
} 