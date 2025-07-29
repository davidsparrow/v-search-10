import React, { useState } from 'react';
import { Button, Input, Card, Space, Typography } from 'antd';
import { isCriticalMessage, extractCriticalKeyword, storeCriticalMessage } from '../lib/criticalMessages';
import { useCloudStore } from '../store/cloudStore';

const { Text, Title } = Typography;

export const CriticalMessageTest: React.FC = () => {
  const [testMessage, setTestMessage] = useState('');
  const [result, setResult] = useState<string>('');
  const { addCriticalMessage } = useCloudStore();

  const testCriticalDetection = () => {
    const isCritical = isCriticalMessage(testMessage);
    const keyword = extractCriticalKeyword(testMessage);
    
    setResult(`
      Message: "${testMessage}"
      Is Critical: ${isCritical}
      Keyword: ${keyword || 'None'}
    `);
  };

  const testStoreCriticalMessage = async () => {
    if (!isCriticalMessage(testMessage)) {
      setResult('Message is not critical. Cannot store.');
      return;
    }

    try {
      const message = await storeCriticalMessage(
        'test-participant-id',
        'test-session-id',
        testMessage
      );

      if (message) {
        addCriticalMessage(message);
        setResult(`Critical message stored successfully! ID: ${message.id}`);
      } else {
        setResult('Failed to store critical message.');
      }
    } catch (error) {
      setResult(`Error storing message: ${error}`);
    }
  };

  const testExamples = [
    'EMERGENCY: Server down!',
    'URGENT: Need immediate response',
    'CRITICAL: System failure',
    'Hello, how are you?',
    'Just a normal message'
  ];

  return (
    <Card title="Critical Message Test" style={{ margin: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Title level={4}>Test Critical Message Detection</Title>
        
        <Input.TextArea
          value={testMessage}
          onChange={(e) => setTestMessage(e.target.value)}
          placeholder="Enter a message to test..."
          rows={3}
        />

        <Space>
          <Button type="primary" onClick={testCriticalDetection}>
            Test Detection
          </Button>
          <Button onClick={testStoreCriticalMessage}>
            Test Store
          </Button>
        </Space>

        {result && (
          <Card size="small" title="Result">
            <Text style={{ whiteSpace: 'pre-line' }}>{result}</Text>
          </Card>
        )}

        <Card size="small" title="Test Examples">
          <Space direction="vertical">
            {testExamples.map((example, index) => (
              <Button
                key={index}
                size="small"
                onClick={() => setTestMessage(example)}
              >
                {example}
              </Button>
            ))}
          </Space>
        </Card>
      </Space>
    </Card>
  );
}; 