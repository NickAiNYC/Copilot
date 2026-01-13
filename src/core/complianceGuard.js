// complianceGuard.js - WhatsApp TOS Compliance Engine
// Prevents spam flags and account bans

export class ComplianceGuard {
  constructor() {
    this.maxEmojis = 3;
    this.maxExclamationMarks = 2;
    this.bannedPhrases = [
      'limited time',
      'act now',
      'hurry',
      'last chance',
      'going fast',
      'don\'t miss',
      'once in a lifetime',
      'exclusive offer',
      'urgent sale',
      'fire sale',
      'blowout',
      'clearance',
      'must sell today',
      'price slashed',
      'below market',
      'steal',
      'unbelievable price',
      'you won\'t believe',
      'guaranteed authentic',
      '100% genuine',
      'certified authentic',
      'investment grade',
      'financial freedom',
      'get rich',
      'earn money',
      'passive income',
      'no lowballers',
      'no tire kickers',
      'serious buyers only',
      'price is firm'
    ];
    
    this.warningPhrases = [
      'dm for price',
      'message for price',
      'whatsapp for price',
      'contact for price',
      'call me at',
      'text me at',
      'email me at',
      'send offer',
      'make offer',
      'best offer'
    ];
    
    this.phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    this.urlRegex = /https?:\/\/[^\s]+/g;
    this.emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
    this.excessiveCapsRegex = /\b[A-Z]{4,}\b/g;
  }

  /**
   * Pre-check: Analyze text before generation
   */
  preCheck(userInput) {
    const warnings = [];
    const text = userInput.toLowerCase();
    
    // Check for banned phrases
    this.bannedPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        warnings.push({
          type: 'banned_phrase',
          phrase,
          severity: 'high',
          message: `"${phrase}" may trigger spam filters`
        });
      }
    });
    
    // Check for warning phrases
    this.warningPhrases.forEach(phrase => {
      if (text.includes(phrase)) {
        warnings.push({
          type: 'warning_phrase',
          phrase,
          severity: 'medium',
          message: `"${phrase}" may be flagged by WhatsApp`
        });
      }
    });
    
    // Check phone numbers
    if (this.phoneRegex.test(userInput)) {
      warnings.push({
        type: 'phone_number',
        severity: 'high',
        message: 'Phone numbers should be shared via DM only'
      });
    }
    
    // Check URLs
    if (this.urlRegex.test(userInput)) {
      warnings.push({
        type: 'url_detected',
        severity: 'medium',
        message: 'External links may be flagged as spam'
      });
    }
    
    return {
      passed: warnings.length === 0,
      warnings,
      riskScore: Math.min(warnings.length * 20, 100)
    };
  }

  /**
   * Sanitize: Clean generated text
   */
  sanitize(generatedText) {
    let sanitized = generatedText;
    
    // 1. Remove banned phrases (with context)
    this.bannedPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      sanitized = sanitized.replace(regex, this.getSafeReplacement(phrase));
    });
    
    // 2. Replace warning phrases
    this.warningPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      sanitized = sanitized.replace(regex, 'DM for details');
    });
    
    // 3. Remove phone numbers
    sanitized = sanitized.replace(this.phoneRegex, '[DM for contact]');
    
    // 4. Remove URLs
    sanitized = sanitized.replace(this.urlRegex, '[link removed for compliance]');
    
    // 5. Limit emojis
    const emojis = sanitized.match(this.emojiRegex) || [];
    if (emojis.length > this.maxEmojis) {
      const allowedEmojis = emojis.slice(0, this.maxEmojis);
      sanitized = sanitized.replace(this.emojiRegex, '').trim();
      sanitized += ' ' + allowedEmojis.join('');
    }
    
    // 6. Reduce excessive caps
    sanitized = sanitized.replace(this.excessiveCapsRegex, match => {
      return match.charAt(0) + match.slice(1).toLowerCase();
    });
    
    // 7. Reduce excessive punctuation
    sanitized = sanitized.replace(/!{3,}/g, '!'.repeat(this.maxExclamationMarks));
    sanitized = sanitized.replace(/\?{3,}/g, '??');
    
    // 8. Ensure no spammy formatting
    sanitized = sanitized.replace(/\n{4,}/g, '\n\n');
    
    return sanitized.trim();
  }

  /**
   * Check rate limits
   */
  checkRateLimit(usageData) {
    const { copiesLastHour, copiesToday } = usageData || { copiesLastHour: 0, copiesToday: 0 };
    
    const limits = {
      maxPerHour: 50,
      maxPerDay: 200,
      safePerHour: 30,
      safePerDay: 100
    };
    
    const warnings = [];
    
    if (copiesLastHour > limits.safePerHour) {
      warnings.push({
        type: 'rate_limit_warning',
        severity: 'medium',
        message: `You've copied ${copiesLastHour} times in the last hour. Slow down to avoid detection.`
      });
    }
    
    if (copiesToday > limits.safePerDay) {
      warnings.push({
        type: 'rate_limit_warning',
        severity: 'high',
        message: `You've copied ${copiesToday} times today. Consider taking a break.`
      });
    }
    
    return {
      allowed: copiesLastHour < limits.maxPerHour && copiesToday < limits.maxPerDay,
      warnings,
      limits: {
        remainingHour: Math.max(0, limits.maxPerHour - copiesLastHour),
        remainingDay: Math.max(0, limits.maxPerDay - copiesToday)
      }
    };
  }

  /**
   * Get safe replacement for banned phrase
   */
  getSafeReplacement(phrase) {
    const replacements = {
      'limited time': 'available',
      'act now': 'inquire today',
      'hurry': '',
      'last chance': 'opportunity',
      'going fast': 'available',
      'don\'t miss': 'consider',
      'urgent sale': 'available',
      'fire sale': 'priced to sell',
      'steal': 'great value',
      'unbelievable price': 'competitive price',
      'guaranteed authentic': 'authentic',
      '100% genuine': 'genuine',
      'investment grade': 'collectible',
      'no lowballers': 'serious inquiries',
      'price is firm': 'price reflects market value'
    };
    
    return replacements[phrase] || '';
  }

  /**
   * Full compliance check pipeline
   */
  async checkCompliance(text, usageData = null) {
    const preCheck = this.preCheck(text);
    const sanitized = this.sanitize(text);
    const rateLimit = usageData ? this.checkRateLimit(usageData) : null;
    
    return {
      original: text,
      sanitized,
      preCheck,
      rateLimit,
      final: sanitized,
      timestamp: Date.now(),
      hash: this.generateHash(text)
    };
  }

  /**
   * Generate hash for tracking
   */
  generateHash(text) {
    // Simple hash for duplicate detection
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }
}

// Export singleton instance
export const complianceGuard = new ComplianceGuard();
