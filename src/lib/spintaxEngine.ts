/**
 * Enhanced Spintax Engine for AskBender Message Processing
 * 
 * This module handles template-based response generation with spintax patterns,
 * word libraries, and grammar scaling based on sobriety levels.
 * 
 * @author AskBender Team
 * @version 1.0.0
 */

// Type definitions for spintax processing
export interface SpintaxContext {
  interaction_type: string;
  effective_mood: string;
  sobriety_level: number;
  funeral_mode_active: boolean;
  participant?: any;
  group?: any;
  message?: any;
}

export interface WordLibrary {
  [category: string]: string[];
}

export interface TemplateResponse {
  content: string;
  mood: string;
  grammar_level: number;
  character_count: number;
}

/**
 * Enhanced Spintax Engine for generating varied responses using templates
 */
export class EnhancedSpintaxEngine {
  private wordLibraries: WordLibrary;
  private templateCache: Map<string, string>;
  private performanceMetrics: {
    cacheHits: number;
    cacheMisses: number;
    totalRequests: number;
  };

  constructor() {
    this.wordLibraries = this.initializeWordLibraries();
    this.templateCache = new Map();
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      totalRequests: 0
    };
  }

  /**
   * Generates a response using spintax templates and context
   * 
   * @param templateName - The name of the template to use
   * @param context - The context for the response
   * @param mood - The mood to apply (optional, uses context.effective_mood if not provided)
   * @returns Generated response with metadata
   */
  generateResponse(templateName: string, context: SpintaxContext, mood?: string): TemplateResponse {
    this.performanceMetrics.totalRequests++;
    
    const effectiveMood = mood || context.effective_mood || 'original';
    const template = this.getTemplate(templateName, effectiveMood);
    
    if (!template) {
      throw new Error(`Template not found: ${templateName} for mood: ${effectiveMood}`);
    }
    
    // Process the template with spintax
    const processedContent = this.processSpintaxTemplate(template, context);
    
    // Apply grammar scaling based on sobriety level
    const finalContent = this.applyGrammarLevel(processedContent, context.sobriety_level, context.funeral_mode_active);
    
    return {
      content: finalContent,
      mood: effectiveMood,
      grammar_level: context.sobriety_level,
      character_count: finalContent.length
    };
  }

  /**
   * Processes a spintax template with context variables
   * 
   * @param template - The spintax template string
   * @param context - The context for variable substitution
   * @returns Processed template with variables replaced
   */
  processSpintaxTemplate(template: string, context: SpintaxContext): string {
    let processed = template;
    
    // Replace context variables
    processed = this.replaceContextVariables(processed, context);
    
    // Process spintax patterns like {option1|option2|option3}
    processed = this.processSpintaxPatterns(processed);
    
    // Inject word library terms
    processed = this.injectWordLibraryTerms(processed, context);
    
    return processed;
  }

  /**
   * Applies grammar level scaling based on sobriety level
   * 
   * @param content - The content to process
   * @param sobrietyLevel - The sobriety level (0-100)
   * @param funeralModeActive - Whether funeral mode is active
   * @returns Content with grammar adjustments
   */
  applyGrammarLevel(content: string, sobrietyLevel: number, funeralModeActive: boolean): string {
    let adjusted = content;
    
    // Apply sobriety-based grammar scaling
    if (sobrietyLevel < 30) {
      // Very drunk - lots of typos and slurred speech
      adjusted = this.applyDrunkGrammar(adjusted, sobrietyLevel);
    } else if (sobrietyLevel < 60) {
      // Moderately drunk - some typos and casual language
      adjusted = this.applyModerateGrammar(adjusted, sobrietyLevel);
    } else if (sobrietyLevel < 80) {
      // Slightly tipsy - minor grammar issues
      adjusted = this.applyTipsyGrammar(adjusted, sobrietyLevel);
    } else {
      // Sober - clean grammar
      adjusted = this.applySoberGrammar(adjusted);
    }
    
    // Apply funeral mode if active
    if (funeralModeActive) {
      adjusted = this.applyFuneralMode(adjusted);
    }
    
    return adjusted;
  }

  /**
   * Gets a template by name and mood
   * 
   * @param templateName - The template name
   * @param mood - The mood to use
   * @returns Template string or null if not found
   */
  private getTemplate(templateName: string, mood: string): string | null {
    const cacheKey = `${templateName}_${mood}`;
    
    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      this.performanceMetrics.cacheHits++;
      return this.templateCache.get(cacheKey) || null;
    }
    
    this.performanceMetrics.cacheMisses++;
    
    // In a real implementation, this would query the database
    const template = this.getTemplateFromDatabase(templateName, mood);
    
    if (template) {
      this.templateCache.set(cacheKey, template);
    }
    
    return template;
  }

  /**
   * Replaces context variables in the template
   * 
   * @param template - The template string
   * @param context - The context object
   * @returns Template with variables replaced
   */
  private replaceContextVariables(template: string, context: SpintaxContext): string {
    let processed = template;
    
    // Replace common context variables
    const variables = {
      '{{participant_name}}': context.participant?.nickname || 'Comrade',
      '{{group_name}}': context.group?.name || 'the group',
      '{{interaction_type}}': context.interaction_type || 'general',
      '{{mood}}': context.effective_mood || 'original',
      '{{sobriety_level}}': context.sobriety_level?.toString() || '50'
    };
    
    for (const [variable, value] of Object.entries(variables)) {
      processed = processed.replace(new RegExp(variable, 'g'), value);
    }
    
    return processed;
  }

  /**
   * Processes spintax patterns like {option1|option2|option3}
   * 
   * @param template - The template string
   * @returns Template with spintax patterns resolved
   */
  private processSpintaxPatterns(template: string): string {
    const spintaxPattern = /\{([^}]+)\}/g;
    
    return template.replace(spintaxPattern, (match, options) => {
      const optionArray = options.split('|');
      const randomIndex = Math.floor(Math.random() * optionArray.length);
      return optionArray[randomIndex].trim();
    });
  }

  /**
   * Injects word library terms into the template
   * 
   * @param template - The template string
   * @param context - The context object
   * @returns Template with word library terms injected
   */
  private injectWordLibraryTerms(template: string, context: SpintaxContext): string {
    let processed = template;
    
    // Replace word library placeholders
    const wordLibraryPattern = /\{\{word_library:([^}]+)\}\}/g;
    
    return processed.replace(wordLibraryPattern, (match, category) => {
      const words = this.wordLibraries[category] || [];
      if (words.length === 0) return match;
      
      const randomWord = words[Math.floor(Math.random() * words.length)];
      return randomWord;
    });
  }

  /**
   * Applies drunk grammar patterns
   * 
   * @param content - The content to process
   * @param sobrietyLevel - The sobriety level
   * @returns Content with drunk grammar applied
   */
  private applyDrunkGrammar(content: string, sobrietyLevel: number): string {
    let processed = content;
    
    // Add slurred speech patterns
    const slurredReplacements = [
      { from: /s/g, to: 'sh' },
      { from: /th/g, to: 'd' },
      { from: /ing/g, to: 'in\'' },
      { from: /you/g, to: 'ya' },
      { from: /are/g, to: 'r' },
      { from: /going/g, to: 'goin\'' }
    ];
    
    // Apply more slurring for lower sobriety levels
    const slurIntensity = Math.max(0.1, (30 - sobrietyLevel) / 30);
    
    slurredReplacements.forEach(({ from, to }) => {
      if (Math.random() < slurIntensity) {
        processed = processed.replace(from, to);
      }
    });
    
    // Add random typos
    const typos = [
      { from: /the/g, to: 'teh' },
      { from: /and/g, to: 'adn' },
      { from: /with/g, to: 'wth' },
      { from: /that/g, to: 'taht' }
    ];
    
    typos.forEach(({ from, to }) => {
      if (Math.random() < 0.3) {
        processed = processed.replace(from, to);
      }
    });
    
    return processed;
  }

  /**
   * Applies moderate grammar patterns
   * 
   * @param content - The content to process
   * @param sobrietyLevel - The sobriety level
   * @returns Content with moderate grammar applied
   */
  private applyModerateGrammar(content: string, sobrietyLevel: number): string {
    let processed = content;
    
    // Add casual language
    const casualReplacements = [
      { from: /you are/g, to: 'you\'re' },
      { from: /I am/g, to: 'I\'m' },
      { from: /going to/g, to: 'gonna' },
      { from: /want to/g, to: 'wanna' }
    ];
    
    casualReplacements.forEach(({ from, to }) => {
      if (Math.random() < 0.5) {
        processed = processed.replace(from, to);
      }
    });
    
    // Add some typos
    if (Math.random() < 0.2) {
      processed = processed.replace(/the/g, 'teh');
    }
    
    return processed;
  }

  /**
   * Applies tipsy grammar patterns
   * 
   * @param content - The content to process
   * @param sobrietyLevel - The sobriety level
   * @returns Content with tipsy grammar applied
   */
  private applyTipsyGrammar(content: string, sobrietyLevel: number): string {
    let processed = content;
    
    // Add occasional casual language
    const casualReplacements = [
      { from: /you are/g, to: 'you\'re' },
      { from: /I am/g, to: 'I\'m' }
    ];
    
    casualReplacements.forEach(({ from, to }) => {
      if (Math.random() < 0.3) {
        processed = processed.replace(from, to);
      }
    });
    
    return processed;
  }

  /**
   * Applies sober grammar (clean, professional)
   * 
   * @param content - The content to process
   * @returns Content with sober grammar applied
   */
  private applySoberGrammar(content: string): string {
    // Sober grammar is clean and professional
    return content;
  }

  /**
   * Applies funeral mode (respectful, somber)
   * 
   * @param content - The content to process
   * @returns Content with funeral mode applied
   */
  private applyFuneralMode(content: string): string {
    let processed = content;
    
    // Add respectful language
    const respectfulReplacements = [
      { from: /damn/g, to: 'darn' },
      { from: /hell/g, to: 'heck' },
      { from: /shit/g, to: 'shoot' },
      { from: /fuck/g, to: 'fudge' }
    ];
    
    respectfulReplacements.forEach(({ from, to }) => {
      processed = processed.replace(new RegExp(from, 'gi'), to);
    });
    
    return processed;
  }

  /**
   * Initializes word libraries for different categories
   * 
   * @returns Word libraries object
   */
  private initializeWordLibraries(): WordLibrary {
    return {
      percentages: ['25%', '50%', '75%', '100%', 'half', 'quarter', 'third'],
      terrible_inventions: ['robot butler', 'flying car', 'time machine', 'teleporter', 'mind reader'],
      emotions: ['excited', 'confused', 'surprised', 'amused', 'curious', 'skeptical'],
      greetings: ['Hello', 'Hi there', 'Greetings', 'Hey', 'Good day'],
      farewells: ['Goodbye', 'See you later', 'Take care', 'Until next time', 'Farewell'],
      affirmations: ['Absolutely', 'Definitely', 'Certainly', 'Without a doubt', 'You bet'],
      negations: ['No way', 'Not a chance', 'Absolutely not', 'Never', 'Impossible'],
      exclamations: ['Wow!', 'Amazing!', 'Incredible!', 'Fantastic!', 'Brilliant!'],
      questions: ['What do you think?', 'How about that?', 'Interesting, right?', 'Pretty cool, huh?'],
      transitions: ['However', 'Meanwhile', 'On the other hand', 'In contrast', 'That said']
    };
  }

  /**
   * Gets template from database (mock implementation)
   * 
   * @param templateName - The template name
   * @param mood - The mood
   * @returns Template string or null
   */
  private getTemplateFromDatabase(templateName: string, mood: string): string | null {
    // Mock templates - in reality, this would query the database
    const templates: { [key: string]: { [mood: string]: string } } = {
      'greeting': {
        'original': 'Hello {{participant_name}}! Welcome to {{group_name}}.',
        'professional': 'Good day {{participant_name}}. Welcome to {{group_name}}.',
        'funny': 'Hey {{participant_name}}! Ready for some fun?'
      },
      'question_response': {
        'original': 'That\'s a great question! {{word_library:affirmations}}.',
        'professional': 'Thank you for your inquiry. Let me address that for you.',
        'funny': '{{word_library:exclamations}} That\'s what I was thinking too!'
      },
      'spreadsheet_help': {
        'original': 'I can help you with that spreadsheet! {{word_library:affirmations}}.',
        'professional': 'I\'ll assist you with the spreadsheet mapping process.',
        'funny': 'Spreadsheets? {{word_library:exclamations}} I love organizing data!'
      },
      'vendor_search': {
        'original': 'Let me find some vendors for you! {{word_library:affirmations}}.',
        'professional': 'I\'ll search for appropriate vendors based on your requirements.',
        'funny': 'Vendor hunting time! {{word_library:exclamations}}'
      }
    };
    
    return templates[templateName]?.[mood] || templates[templateName]?.['original'] || null;
  }

  /**
   * Gets performance metrics for monitoring
   * 
   * @returns Performance metrics object
   */
  getPerformanceMetrics() {
    const hitRate = this.performanceMetrics.totalRequests > 0 
      ? (this.performanceMetrics.cacheHits / this.performanceMetrics.totalRequests) * 100 
      : 0;
    
    return {
      ...this.performanceMetrics,
      cacheHitRate: `${hitRate.toFixed(2)}%`
    };
  }

  /**
   * Clears the template cache
   */
  clearCache() {
    this.templateCache.clear();
    this.performanceMetrics.cacheHits = 0;
    this.performanceMetrics.cacheMisses = 0;
    this.performanceMetrics.totalRequests = 0;
  }
}

/**
 * Creates a new instance of the Enhanced Spintax Engine
 * 
 * @returns New spintax engine instance
 */
export function createSpintaxEngine(): EnhancedSpintaxEngine {
  return new EnhancedSpintaxEngine();
}

/**
 * Processes a simple spintax string without full context
 * 
 * @param spintaxString - The spintax string to process
 * @returns Processed string with spintax resolved
 */
export function processSimpleSpintax(spintaxString: string): string {
  const engine = new EnhancedSpintaxEngine();
  const context: SpintaxContext = {
    interaction_type: 'simple',
    effective_mood: 'original',
    sobriety_level: 50,
    funeral_mode_active: false
  };
  
  return engine.processSpintaxTemplate(spintaxString, context);
} 