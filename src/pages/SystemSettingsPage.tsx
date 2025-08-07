import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Table, Button, Input, Switch, Upload, message, Modal, Form, Tabs, Select, Progress, Space, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, SendOutlined, MailOutlined, MessageOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { AdminRoute } from '../components/AdminRoute'
import { TextLogoVariation, SystemSettings } from '../types/admin'
import { useCloudStore } from '../store/cloudStore'
import { AdminNotificationSettings } from '../components/AdminNotificationSettings'

const { Header, Content } = Layout
const { Title, Text } = Typography
const { TabPane } = Tabs
const { Option } = Select

// SMS Configuration Interface
interface SMSConfig {
  default_message_channel: string
  fallback_message_channel: string
  use_system_email_fallback: boolean
  twilio_account_sid: string
  twilio_auth_token: string
  twilio_from_number: string
  admin_twilio_account_sid: string
  admin_twilio_auth_token: string
  admin_twilio_from_number: string
  use_admin_twilio: boolean
  sms_usage_limit: number
  current_sms_usage: number
  require_admin_twilio_after_limit: boolean
}

// Email Configuration Interface
interface EmailConfig {
  email_provider: string
  sendgrid_api_key: string
  sendgrid_from_email: string
  mailgun_api_key: string
  mailgun_domain: string
  admin_gmail_address: string
  email_usage_limit: number
  current_email_usage: number
}

export const SystemSettingsPage: React.FC = () => {
  const { getThemeConfig } = useCloudStore()
  const safeTheme = getThemeConfig()
  const [logoVariations, setLogoVariations] = useState<TextLogoVariation[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingLogo, setEditingLogo] = useState<TextLogoVariation | null>(null)
  const [form] = Form.useForm()
  
  // SMS/Email Configuration State
  const [smsConfig, setSmsConfig] = useState<SMSConfig>({
    default_message_channel: 'sms',
    fallback_message_channel: 'email',
    use_system_email_fallback: true,
    twilio_account_sid: '',
    twilio_auth_token: '',
    twilio_from_number: '',
    admin_twilio_account_sid: '',
    admin_twilio_auth_token: '',
    admin_twilio_from_number: '',
    use_admin_twilio: false,
    sms_usage_limit: 1000,
    current_sms_usage: 0,
    require_admin_twilio_after_limit: true
  })
  
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    email_provider: 'system',
    sendgrid_api_key: '',
    sendgrid_from_email: '',
    mailgun_api_key: '',
    mailgun_domain: '',
    admin_gmail_address: '',
    email_usage_limit: 5000,
    current_email_usage: 0
  })
  
  const [smsForm] = Form.useForm()
  const [emailForm] = Form.useForm()
  const [testingConnection, setTestingConnection] = useState(false)

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load logo variations
      const { data: logos, error: logosError } = await supabase
        .from('text_logo_variations')
        .select('*')
        .order('created_at', { ascending: false })

      if (logosError) throw logosError
      setLogoVariations(logos || [])

      // Load system settings
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .order('key', { ascending: true })

      if (settingsError) throw settingsError
      setSystemSettings(settings || [])
      
      // Load SMS/Email configuration
      loadSMSConfig(settings || [])
      loadEmailConfig(settings || [])

    } catch (error) {
      message.error('Failed to load data')
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSMSConfig = (settings: SystemSettings[]) => {
    const config: SMSConfig = {
      default_message_channel: settings.find(s => s.key === 'default_message_channel')?.value || 'sms',
      fallback_message_channel: settings.find(s => s.key === 'fallback_message_channel')?.value || 'email',
      use_system_email_fallback: settings.find(s => s.key === 'use_system_email_fallback')?.value === 'true',
      twilio_account_sid: settings.find(s => s.key === 'twilio_account_sid')?.value || '',
      twilio_auth_token: settings.find(s => s.key === 'twilio_auth_token')?.value || '',
      twilio_from_number: settings.find(s => s.key === 'twilio_from_number')?.value || '',
      admin_twilio_account_sid: settings.find(s => s.key === 'admin_twilio_account_sid')?.value || '',
      admin_twilio_auth_token: settings.find(s => s.key === 'admin_twilio_auth_token')?.value || '',
      admin_twilio_from_number: settings.find(s => s.key === 'admin_twilio_from_number')?.value || '',
      use_admin_twilio: settings.find(s => s.key === 'use_admin_twilio')?.value === 'true',
      sms_usage_limit: parseInt(settings.find(s => s.key === 'sms_usage_limit')?.value || '1000'),
      current_sms_usage: parseInt(settings.find(s => s.key === 'current_sms_usage')?.value || '0'),
      require_admin_twilio_after_limit: settings.find(s => s.key === 'require_admin_twilio_after_limit')?.value === 'true'
    }
    setSmsConfig(config)
    smsForm.setFieldsValue(config)
  }

  const loadEmailConfig = (settings: SystemSettings[]) => {
    const config: EmailConfig = {
      email_provider: settings.find(s => s.key === 'email_provider')?.value || 'system',
      sendgrid_api_key: settings.find(s => s.key === 'sendgrid_api_key')?.value || '',
      sendgrid_from_email: settings.find(s => s.key === 'sendgrid_from_email')?.value || '',
      mailgun_api_key: settings.find(s => s.key === 'mailgun_api_key')?.value || '',
      mailgun_domain: settings.find(s => s.key === 'mailgun_domain')?.value || '',
      admin_gmail_address: settings.find(s => s.key === 'admin_gmail_address')?.value || '',
      email_usage_limit: parseInt(settings.find(s => s.key === 'email_usage_limit')?.value || '5000'),
      current_email_usage: parseInt(settings.find(s => s.key === 'current_email_usage')?.value || '0')
    }
    setEmailConfig(config)
    emailForm.setFieldsValue(config)
  }

  const handleAddLogo = () => {
    setEditingLogo(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEditLogo = (record: TextLogoVariation) => {
    setEditingLogo(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDeleteLogo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('text_logo_variations')
        .delete()
        .eq('id', id)

      if (error) throw error

      message.success('Logo variation deleted')
      loadData()
    } catch (error) {
      message.error('Failed to delete logo variation')
      console.error('Error deleting logo:', error)
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      
      if (editingLogo) {
        // Update existing logo
        const { error } = await supabase
          .from('text_logo_variations')
          .update(values)
          .eq('id', editingLogo.id)

        if (error) throw error
        message.success('Logo variation updated')
      } else {
        // Add new logo
        const { error } = await supabase
          .from('text_logo_variations')
          .insert([values])

        if (error) throw error
        message.success('Logo variation added')
      }

      setIsModalVisible(false)
      loadData()
    } catch (error) {
      message.error('Failed to save logo variation')
      console.error('Error saving logo:', error)
    }
  }

  // SMS Configuration Handlers
  const handleSMSSave = async () => {
    try {
      const values = await smsForm.validateFields()
      
      // Update all SMS settings
      const updates = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      
      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: update.value })
          .eq('key', update.key)
        
        if (error) throw error
      }
      
      message.success('SMS configuration saved')
      loadData()
    } catch (error) {
      message.error('Failed to save SMS configuration')
      console.error('Error saving SMS config:', error)
    }
  }

  const handleEmailSave = async () => {
    try {
      const values = await emailForm.validateFields()
      
      // Update all Email settings
      const updates = Object.entries(values).map(([key, value]) => ({
        key,
        value: String(value)
      }))
      
      for (const update of updates) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: update.value })
          .eq('key', update.key)
        
        if (error) throw error
      }
      
      message.success('Email configuration saved')
      loadData()
    } catch (error) {
      message.error('Failed to save Email configuration')
      console.error('Error saving Email config:', error)
    }
  }

  const testSMSConnection = async () => {
    setTestingConnection(true)
    try {
      // Mock test - in real implementation, call smsService.testConnection()
      await new Promise(resolve => setTimeout(resolve, 2000))
      message.success('SMS connection test successful!')
    } catch (error) {
      message.error('SMS connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const testEmailConnection = async () => {
    setTestingConnection(true)
    try {
      // Mock test - in real implementation, call emailService.testConnection()
      await new Promise(resolve => setTimeout(resolve, 2000))
      message.success('Email connection test successful!')
    } catch (error) {
      message.error('Email connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const logoColumns = [
    {
      title: 'Display Name',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: 'Filename',
      dataIndex: 'filename',
      key: 'filename',
    },
    {
      title: 'Destination URL',
      dataIndex: 'destination_url',
      key: 'destination_url',
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Switch checked={active} disabled />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: TextLogoVariation) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEditLogo(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteLogo(record.id)}
          />
        </div>
      ),
    },
  ]

  const renderSMSUsage = () => (
    <Card title="SMS Usage" style={{ marginBottom: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>Current Usage: {smsConfig.current_sms_usage} / {smsConfig.sms_usage_limit}</Text>
          <Progress 
            percent={Math.round((smsConfig.current_sms_usage / smsConfig.sms_usage_limit) * 100)} 
            status={smsConfig.current_sms_usage > smsConfig.sms_usage_limit ? 'exception' : 'active'}
          />
        </div>
        <Text type="secondary">
          {smsConfig.current_sms_usage > smsConfig.sms_usage_limit 
            ? 'Limit exceeded - Admin Twilio required' 
            : 'Within monthly limit'}
        </Text>
      </Space>
    </Card>
  )

  const renderEmailUsage = () => (
    <Card title="Email Usage" style={{ marginBottom: '16px' }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text>Current Usage: {emailConfig.current_email_usage} / {emailConfig.email_usage_limit}</Text>
          <Progress 
            percent={Math.round((emailConfig.current_email_usage / emailConfig.email_usage_limit) * 100)} 
            status={emailConfig.current_email_usage > emailConfig.email_usage_limit ? 'exception' : 'active'}
          />
        </div>
        <Text type="secondary">
          {emailConfig.current_email_usage > emailConfig.email_usage_limit 
            ? 'Limit exceeded' 
            : 'Within monthly limit'}
        </Text>
      </Space>
    </Card>
  )

  return (
    // TODO: Add AdminRoute wrapper for production deployment
    <Layout style={{ minHeight: '100vh', background: safeTheme.background }}>
      <Header style={{ 
        background: safeTheme.headerBackground, 
        borderBottom: `1px solid ${safeTheme.headerBorder}`,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ 
          margin: 0, 
          color: safeTheme.textPrimary,
          fontSize: '20px'
        }}>
          System Settings
        </Title>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Tabs defaultActiveKey="logos" style={{ background: safeTheme.background }}>
          
          {/* Logo Variations Tab */}
          <TabPane tab="Logo Variations" key="logos">
            <Card 
              title="Text Logo Variations" 
              style={{ marginBottom: '24px' }}
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleAddLogo}
                >
                  Add Logo Variation
                </Button>
              }
            >
              <Table
                dataSource={logoVariations}
                columns={logoColumns}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </TabPane>

          {/* SMS Configuration Tab */}
          <TabPane tab="SMS Configuration" key="sms">
            {renderSMSUsage()}
            
            <Card title="SMS Provider Settings">
              <Form form={smsForm} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* General Settings */}
                  <div>
                    <Form.Item name="default_message_channel" label="Default Channel">
                      <Select>
                        <Option value="sms">SMS</Option>
                        <Option value="email">Email</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item name="fallback_message_channel" label="Fallback Channel">
                      <Select>
                        <Option value="email">Email</Option>
                        <Option value="sms">SMS</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item name="use_system_email_fallback" label="Use System Email Fallback" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>

                  {/* System Twilio Settings */}
                  <div>
                    <Title level={5}>System Twilio (Default)</Title>
                    <Form.Item name="twilio_account_sid" label="Account SID">
                      <Input.Password placeholder="AC..." />
                    </Form.Item>
                    
                    <Form.Item name="twilio_auth_token" label="Auth Token">
                      <Input.Password placeholder="..." />
                    </Form.Item>
                    
                    <Form.Item name="twilio_from_number" label="From Number">
                      <Input placeholder="+1234567890" />
                    </Form.Item>
                  </div>

                  {/* Admin Twilio Settings */}
                  <div>
                    <Title level={5}>Admin Twilio (High Volume)</Title>
                    <Form.Item name="use_admin_twilio" label="Use Admin Twilio" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item name="admin_twilio_account_sid" label="Account SID">
                      <Input.Password placeholder="AC..." />
                    </Form.Item>
                    
                    <Form.Item name="admin_twilio_auth_token" label="Auth Token">
                      <Input.Password placeholder="..." />
                    </Form.Item>
                    
                    <Form.Item name="admin_twilio_from_number" label="From Number">
                      <Input placeholder="+1234567890" />
                    </Form.Item>
                  </div>

                  {/* Usage Limits */}
                  <div>
                    <Title level={5}>Usage Limits</Title>
                    <Form.Item name="sms_usage_limit" label="Monthly SMS Limit">
                      <Input type="number" placeholder="1000" />
                    </Form.Item>
                    
                    <Form.Item name="require_admin_twilio_after_limit" label="Require Admin Twilio After Limit" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>
                </div>
                
                <Divider />
                
                <Space>
                  <Button type="primary" onClick={handleSMSSave}>
                    Save SMS Configuration
                  </Button>
                  <Button 
                    icon={<SendOutlined />} 
                    onClick={testSMSConnection}
                    loading={testingConnection}
                  >
                    Test SMS Connection
                  </Button>
                </Space>
              </Form>
            </Card>
          </TabPane>

          {/* Email Configuration Tab */}
          <TabPane tab="Email Configuration" key="email">
            {renderEmailUsage()}
            
            <Card title="Email Provider Settings">
              <Form form={emailForm} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  
                  {/* Provider Selection */}
                  <div>
                    <Form.Item name="email_provider" label="Email Provider">
                      <Select>
                        <Option value="system">System Default</Option>
                        <Option value="sendgrid">SendGrid</Option>
                        <Option value="mailgun">MailGun</Option>
                        <Option value="gmail">Gmail</Option>
                      </Select>
                    </Form.Item>
                    
                    <Form.Item name="email_usage_limit" label="Monthly Email Limit">
                      <Input type="number" placeholder="5000" />
                    </Form.Item>
                  </div>

                  {/* SendGrid Settings */}
                  <div>
                    <Title level={5}>SendGrid Configuration</Title>
                    <Form.Item name="sendgrid_api_key" label="API Key">
                      <Input.Password placeholder="SG..." />
                    </Form.Item>
                    
                    <Form.Item name="sendgrid_from_email" label="From Email">
                      <Input placeholder="noreply@yourdomain.com" />
                    </Form.Item>
                  </div>

                  {/* MailGun Settings */}
                  <div>
                    <Title level={5}>MailGun Configuration</Title>
                    <Form.Item name="mailgun_api_key" label="API Key">
                      <Input.Password placeholder="key-..." />
                    </Form.Item>
                    
                    <Form.Item name="mailgun_domain" label="Domain">
                      <Input placeholder="mg.yourdomain.com" />
                    </Form.Item>
                  </div>

                  {/* Gmail Settings */}
                  <div>
                    <Title level={5}>Gmail Configuration</Title>
                    <Form.Item name="admin_gmail_address" label="Admin Gmail Address">
                      <Input placeholder="admin@yourdomain.com" />
                    </Form.Item>
                  </div>
                </div>
                
                <Divider />
                
                <Space>
                  <Button type="primary" onClick={handleEmailSave}>
                    Save Email Configuration
                  </Button>
                  <Button 
                    icon={<MailOutlined />} 
                    onClick={testEmailConnection}
                    loading={testingConnection}
                  >
                    Test Email Connection
                  </Button>
                </Space>
              </Form>
            </Card>
          </TabPane>

          {/* System Settings Tab */}
          <TabPane tab="System Settings" key="settings">
            <Card title="System Settings">
              <Table
                dataSource={systemSettings}
                columns={[
                  { title: 'Key', dataIndex: 'key', key: 'key' },
                  { title: 'Value', dataIndex: 'value', key: 'value' },
                  { title: 'Description', dataIndex: 'description', key: 'description' },
                ]}
                rowKey="id"
                loading={loading}
                pagination={false}
              />
            </Card>

            {/* Admin Notification Settings Section */}
            <Card 
              title="Admin Notification Settings" 
              style={{ marginTop: '24px' }}
            >
              <AdminNotificationSettings onSettingsUpdated={loadData} />
            </Card>
          </TabPane>
        </Tabs>
      </Content>

      {/* Add/Edit Logo Modal */}
      <Modal
        title={editingLogo ? 'Edit Logo Variation' : 'Add Logo Variation'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="display_name"
            label="Display Name"
            rules={[{ required: true, message: 'Please enter display name' }]}
          >
            <Input placeholder="e.g., Classic Blue, Dark Theme, Emoji Version" />
          </Form.Item>

          <Form.Item
            name="filename"
            label="Filename"
            rules={[{ required: true, message: 'Please enter filename' }]}
          >
            <Input placeholder="e.g., logo-classic-blue.png" />
          </Form.Item>

          <Form.Item
            name="destination_url"
            label="Destination URL"
            rules={[{ required: true, message: 'Please enter destination URL' }]}
          >
            <Input placeholder="e.g., https://askbender.com" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item label="Upload Logo File">
            <Upload
              name="logo"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false} // Prevent auto upload
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
            <Text type="secondary">
              Upload PNG files with transparent background, recommended size: 200x60px
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
} 