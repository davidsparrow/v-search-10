import React, { useState, useEffect } from 'react'
import { Layout, Typography, Card, Table, Button, Input, Switch, Upload, message, Modal, Form } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { supabase } from '../lib/supabase'
import { AdminRoute } from '../components/AdminRoute'
import { TextLogoVariation, SystemSettings } from '../types/admin'
import { useCloudStore } from '../store/cloudStore'
import { AdminNotificationSettings } from '../components/AdminNotificationSettings'

const { Header, Content } = Layout
const { Title, Text } = Typography

export const SystemSettingsPage: React.FC = () => {
  const { getThemeConfig } = useCloudStore()
  const safeTheme = getThemeConfig()
  const [logoVariations, setLogoVariations] = useState<TextLogoVariation[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingLogo, setEditingLogo] = useState<TextLogoVariation | null>(null)
  const [form] = Form.useForm()

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

    } catch (error) {
      message.error('Failed to load data')
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
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
        {/* Logo Variations Section */}
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

        {/* System Settings Section */}
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