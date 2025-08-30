interface BiometricTemplate {
  id: string;
  user_id: string;
  template_data: string;
  device_info: {
    device_id: string;
    platform: string;
    user_agent: string;
  };
  enrollment_timestamp: number;
  type: 'real' | 'demo';
  quality_score: number;
  last_used: number;
  usage_count: number;
}

interface BiometricDatabase {
  templates: Map<string, BiometricTemplate>;
  userTemplates: Map<string, string[]>; // user_id -> template_ids
}

class BiPayBiometricDatabase {
  private static instance: BiPayBiometricDatabase;
  private database: BiometricDatabase;

  private constructor() {
    this.database = {
      templates: new Map(),
      userTemplates: new Map()
    };
    this.loadFromStorage();
  }

  static getInstance(): BiPayBiometricDatabase {
    if (!BiPayBiometricDatabase.instance) {
      BiPayBiometricDatabase.instance = new BiPayBiometricDatabase();
    }
    return BiPayBiometricDatabase.instance;
  }

  private loadFromStorage(): void {
    try {
      const templatesData = localStorage.getItem('bipay_biometric_database');
      if (templatesData) {
        const parsed = JSON.parse(templatesData);
        this.database.templates = new Map(parsed.templates || []);
        this.database.userTemplates = new Map(parsed.userTemplates || []);
      }
    } catch (error) {
      console.error('Failed to load biometric database:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        templates: Array.from(this.database.templates.entries()),
        userTemplates: Array.from(this.database.userTemplates.entries())
      };
      localStorage.setItem('bipay_biometric_database', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save biometric database:', error);
    }
  }

  async enrollBiometric(userId: string, templateData: string, type: 'real' | 'demo'): Promise<string> {
    const templateId = this.generateTemplateId();
    
    const template: BiometricTemplate = {
      id: templateId,
      user_id: userId,
      template_data: templateData,
      device_info: {
        device_id: this.getDeviceId(),
        platform: navigator.platform,
        user_agent: navigator.userAgent
      },
      enrollment_timestamp: Date.now(),
      type: type,
      quality_score: this.calculateQualityScore(templateData, type),
      last_used: Date.now(),
      usage_count: 0
    };

    // Store template
    this.database.templates.set(templateId, template);
    
    // Update user templates mapping
    const userTemplates = this.database.userTemplates.get(userId) || [];
    userTemplates.push(templateId);
    this.database.userTemplates.set(userId, userTemplates);
    
    this.saveToStorage();
    
    console.log(`✅ Biometric enrolled for user ${userId}:`, {
      templateId,
      type,
      qualityScore: template.quality_score
    });
    
    return templateId;
  }

  async authenticateByBiometric(biometricData: string): Promise<string | null> {
    console.log('🔍 Searching for user by biometric data...');
    
    // Extract pattern from biometric data for matching
    const inputPattern = this.extractPattern(biometricData);
    
    // Convert to array for iteration
    const templates = Array.from(this.database.templates.entries());
    
    for (const [templateId, template] of templates) {
      const storedPattern = this.extractPattern(template.template_data);
      
      // Calculate similarity score
      const similarity = this.calculateSimilarity(inputPattern, storedPattern);
      
      console.log(`Comparing with template ${templateId}: similarity ${similarity}%`);
      
      // Threshold for successful match (85% for real, 75% for demo)
      const threshold = template.type === 'real' ? 0.85 : 0.75;
      
      if (similarity >= threshold) {
        // Update usage statistics
        template.last_used = Date.now();
        template.usage_count++;
        this.saveToStorage();
        
        console.log(`✅ Biometric match found! User: ${template.user_id}`);
        return template.user_id;
      }
    }
    
    console.log('❌ No biometric match found');
    return null;
  }

  getUserTemplates(userId: string): BiometricTemplate[] {
    const templateIds = this.database.userTemplates.get(userId) || [];
    return templateIds.map(id => this.database.templates.get(id)).filter(Boolean) as BiometricTemplate[];
  }

  hasUserEnrolled(userId: string): boolean {
    const templates = this.getUserTemplates(userId);
    return templates.length > 0;
  }

  private generateTemplateId(): string {
    return 'tpl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('bipay_device_id');
    if (!deviceId) {
      deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('bipay_device_id', deviceId);
    }
    return deviceId;
  }

  private calculateQualityScore(templateData: string, type: 'real' | 'demo'): number {
    // Real biometric data typically has higher quality
    if (type === 'real') {
      return 85 + Math.random() * 15; // 85-100%
    } else {
      return 70 + Math.random() * 20; // 70-90%
    }
  }

  private extractPattern(templateData: string): string {
    // Extract the core pattern from template data
    if (templateData.includes('_')) {
      return templateData.split('_')[0] + '_' + templateData.split('_')[1];
    }
    return templateData.substring(0, 20); // First 20 chars as pattern
  }

  private calculateSimilarity(pattern1: string, pattern2: string): number {
    // Simple similarity calculation (can be enhanced with ML algorithms)
    if (pattern1 === pattern2) return 1.0; // 100% match
    
    // Check for pattern prefix match
    const commonPrefix = this.longestCommonPrefix(pattern1, pattern2);
    const similarity = (commonPrefix.length * 2) / (pattern1.length + pattern2.length);
    
    // Add some randomness for demo realism
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    
    return Math.max(0, Math.min(1, similarity + variance));
  }

  private longestCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  // Enhanced biometric template generation
  generateEnhancedTemplate(type: 'real' | 'demo'): string {
    const timestamp = Date.now();
    const deviceId = this.getDeviceId();
    
    if (type === 'real') {
      // Simulate real biometric template with more complexity
      const patterns = [
        'MINUTIAE_RIDGE_ENDING', 'MINUTIAE_BIFURCATION', 'MINUTIAE_ISLAND', 
        'MINUTIAE_SPUR', 'MINUTIAE_CROSSOVER'
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const coordinates = Array.from({length: 20}, () => 
        Math.floor(Math.random() * 512).toString(16).padStart(3, '0')
      ).join('');
      
      return `REAL_${pattern}_${coordinates}_${deviceId}_${timestamp}`;
    } else {
      // Enhanced demo template
      const patterns = [
        'DEMO_ARCH_LOOP', 'DEMO_WHORL_SPIRAL', 'DEMO_TENTED_ARCH', 
        'DEMO_LEFT_LOOP', 'DEMO_RIGHT_LOOP'
      ];
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      const minutiae = Array.from({length: 25}, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');
      
      return `${pattern}_${minutiae}_${deviceId}_${timestamp}`;
    }
  }

  // Get database statistics
  getStats(): any {
    const totalTemplates = this.database.templates.size;
    const templatesArray = Array.from(this.database.templates.values());
    const realTemplates = templatesArray.filter(t => t.type === 'real').length;
    const demoTemplates = totalTemplates - realTemplates;
    const totalUsers = this.database.userTemplates.size;
    
    return {
      totalTemplates,
      realTemplates,
      demoTemplates,
      totalUsers,
      avgQuality: templatesArray.length > 0 
        ? templatesArray.reduce((sum, t) => sum + t.quality_score, 0) / templatesArray.length 
        : 0
    };
  }
}

export const biometricDB = BiPayBiometricDatabase.getInstance();
export { BiPayBiometricDatabase };
export type { BiometricTemplate };
