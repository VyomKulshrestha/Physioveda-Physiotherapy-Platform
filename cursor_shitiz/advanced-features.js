// Advanced Features for PhysioVeda Platform

// Progress tracking system
class ProgressTracker {
    constructor() {
        this.sessions = JSON.parse(localStorage.getItem('physioVedaSessions')) || [];
        this.achievements = JSON.parse(localStorage.getItem('physioVedaAchievements')) || [];
        this.streaks = JSON.parse(localStorage.getItem('physioVedaStreaks')) || { current: 0, longest: 0 };
    }

    addSession(bodyPart, exercise, accuracy, duration, reps) {
        const session = {
            id: Date.now(),
            date: new Date().toISOString(),
            bodyPart,
            exercise: exercise.name,
            accuracy,
            duration,
            reps,
            difficulty: exercise.difficulty
        };
        
        this.sessions.push(session);
        this.updateStreaks();
        this.checkAchievements(session);
        this.saveProgress();
        
        return session;
    }

    updateStreaks() {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const lastSession = this.sessions[this.sessions.length - 1];
        
        if (lastSession && new Date(lastSession.date).toDateString() === today) {
            if (this.sessions.length > 1) {
                const prevSession = this.sessions[this.sessions.length - 2];
                if (new Date(prevSession.date).toDateString() === yesterday) {
                    this.streaks.current++;
                } else {
                    this.streaks.current = 1;
                }
            } else {
                this.streaks.current = 1;
            }
            this.streaks.longest = Math.max(this.streaks.current, this.streaks.longest);
        }
    }

    checkAchievements(session) {
        const achievements = [
            { id: 'first_session', name: 'Getting Started', description: 'Complete your first session', condition: () => this.sessions.length === 1 },
            { id: 'streak_7', name: '7-Day Warrior', description: 'Maintain a 7-day streak', condition: () => this.streaks.current >= 7 },
            { id: 'accuracy_master', name: 'Precision Master', description: 'Achieve 95%+ accuracy', condition: () => session.accuracy >= 95 },
            { id: 'all_body_parts', name: 'Full Body Explorer', description: 'Exercise all body parts', condition: () => {
                const uniqueBodyParts = [...new Set(this.sessions.map(s => s.bodyPart))];
                return uniqueBodyParts.length >= 8;
            }},
            { id: 'century_sessions', name: 'Century Club', description: 'Complete 100 sessions', condition: () => this.sessions.length >= 100 }
        ];

        achievements.forEach(achievement => {
            if (!this.achievements.find(a => a.id === achievement.id) && achievement.condition()) {
                this.achievements.push({
                    ...achievement,
                    unlockedAt: new Date().toISOString()
                });
                this.showAchievementNotification(achievement);
            }
        });
    }

    showAchievementNotification(achievement) {
        // Create achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <i class="fas fa-trophy"></i>
                <div>
                    <h4>Achievement Unlocked!</h4>
                    <p>${achievement.name}</p>
                    <small>${achievement.description}</small>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    saveProgress() {
        localStorage.setItem('physioVedaSessions', JSON.stringify(this.sessions));
        localStorage.setItem('physioVedaAchievements', JSON.stringify(this.achievements));
        localStorage.setItem('physioVedaStreaks', JSON.stringify(this.streaks));
    }

    getWeeklyProgress() {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.sessions.filter(session => new Date(session.date) > weekAgo);
    }

    getAverageAccuracy() {
        if (this.sessions.length === 0) return 0;
        const total = this.sessions.reduce((sum, session) => sum + session.accuracy, 0);
        return Math.round(total / this.sessions.length);
    }
}

// Camera and pose detection simulation
class CameraManager {
    constructor() {
        this.isActive = false;
        this.stream = null;
        this.canvas = null;
        this.ctx = null;
        this.poseData = null;
    }

    async initialize(videoElement, canvasElement) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 640, 
                    height: 480,
                    frameRate: 30 
                } 
            });
            videoElement.srcObject = this.stream;
            this.canvas = canvasElement;
            this.ctx = this.canvas.getContext('2d');
            this.isActive = true;
            return true;
        } catch (error) {
            console.warn('Camera access denied, using simulation mode');
            this.startSimulation(videoElement);
            return false;
        }
    }

    startSimulation(videoElement) {
        // Simulate camera feed with animated background
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        
        const animate = () => {
            if (!this.isActive) return;
            
            // Create animated background
            const gradient = ctx.createRadialGradient(320, 240, 0, 320, 240, 400);
            gradient.addColorStop(0, `hsl(${Date.now() * 0.05 % 360}, 70%, 20%)`);
            gradient.addColorStop(1, 'hsl(240, 70%, 10%)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 640, 480);
            
            // Add some moving particles
            for (let i = 0; i < 20; i++) {
                const x = (Math.sin(Date.now() * 0.001 + i) * 100) + 320;
                const y = (Math.cos(Date.now() * 0.0015 + i) * 80) + 240;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            }
            
            // Simulate skeleton overlay
            this.drawSimulatedSkeleton(ctx);
            
            videoElement.src = canvas.toDataURL();
            requestAnimationFrame(animate);
        };
        
        this.isActive = true;
        animate();
    }

    drawSimulatedSkeleton(ctx) {
        const time = Date.now() * 0.003;
        const centerX = 320;
        const centerY = 240;
        
        // Simulate pose keypoints with movement
        const keypoints = {
            nose: { x: centerX + Math.sin(time) * 5, y: centerY - 80 + Math.cos(time * 1.5) * 3 },
            leftShoulder: { x: centerX - 60, y: centerY - 40 },
            rightShoulder: { x: centerX + 60, y: centerY - 40 },
            leftElbow: { x: centerX - 80 + Math.sin(time * 2) * 10, y: centerY + 20 },
            rightElbow: { x: centerX + 80 + Math.cos(time * 2) * 10, y: centerY + 20 },
            leftWrist: { x: centerX - 90 + Math.sin(time * 2.5) * 15, y: centerY + 60 },
            rightWrist: { x: centerX + 90 + Math.cos(time * 2.5) * 15, y: centerY + 60 },
            leftHip: { x: centerX - 40, y: centerY + 80 },
            rightHip: { x: centerX + 40, y: centerY + 80 },
            leftKnee: { x: centerX - 45, y: centerY + 140 },
            rightKnee: { x: centerX + 45, y: centerY + 140 },
            leftAnkle: { x: centerX - 50, y: centerY + 200 },
            rightAnkle: { x: centerX + 50, y: centerY + 200 }
        };

        // Draw skeleton connections
        const connections = [
            ['nose', 'leftShoulder'], ['nose', 'rightShoulder'],
            ['leftShoulder', 'rightShoulder'],
            ['leftShoulder', 'leftElbow'], ['leftElbow', 'leftWrist'],
            ['rightShoulder', 'rightElbow'], ['rightElbow', 'rightWrist'],
            ['leftShoulder', 'leftHip'], ['rightShoulder', 'rightHip'],
            ['leftHip', 'rightHip'],
            ['leftHip', 'leftKnee'], ['leftKnee', 'leftAnkle'],
            ['rightHip', 'rightKnee'], ['rightKnee', 'rightAnkle']
        ];

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        
        connections.forEach(([from, to]) => {
            ctx.beginPath();
            ctx.moveTo(keypoints[from].x, keypoints[from].y);
            ctx.lineTo(keypoints[to].x, keypoints[to].y);
            ctx.stroke();
        });

        // Draw keypoints
        ctx.fillStyle = '#ff0000';
        Object.values(keypoints).forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        this.poseData = keypoints;
    }

    getPoseAccuracy(exerciseType) {
        if (!this.poseData) return 0;
        
        // Simulate exercise-specific accuracy calculations
        const baseAccuracy = 75 + Math.random() * 20;
        const timeVariation = Math.sin(Date.now() * 0.001) * 5;
        
        return Math.max(0, Math.min(100, baseAccuracy + timeVariation));
    }

    stop() {
        this.isActive = false;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}

// Voice guidance system
class VoiceGuide {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        this.isEnabled = localStorage.getItem('physioVedaVoiceEnabled') !== 'false';
        this.initializeVoice();
    }

    initializeVoice() {
        if (this.synthesis) {
            const voices = this.synthesis.getVoices();
            this.voice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        }
    }

    speak(text, priority = 'normal') {
        if (!this.isEnabled || !this.synthesis) return;

        if (priority === 'high') {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.voice;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        this.synthesis.speak(utterance);
    }

    provideExerciseFeedback(accuracy, form, reps) {
        if (accuracy > 90) {
            this.speak("Excellent form! Keep it up!");
        } else if (accuracy > 75) {
            this.speak("Good job! Try to maintain better alignment.");
        } else if (accuracy > 60) {
            this.speak("Focus on your posture and slow down the movement.");
        } else {
            this.speak("Let's pause and review the proper form.", 'high');
        }
    }

    announcePhase(phase) {
        const messages = {
            warmup: "Let's start with a gentle warm-up",
            exercise: "Beginning exercise phase. Focus on your form",
            rest: "Take a 30-second rest. Breathe deeply",
            cooldown: "Great work! Time for cool-down stretches",
            complete: "Session complete! Excellent effort today"
        };
        
        if (messages[phase]) {
            this.speak(messages[phase]);
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        localStorage.setItem('physioVedaVoiceEnabled', this.isEnabled);
        this.speak(this.isEnabled ? "Voice guidance enabled" : "Voice guidance disabled");
    }
}

// Biometric integration simulation
class BiometricMonitor {
    constructor() {
        this.heartRate = 70;
        this.calories = 0;
        this.isMonitoring = false;
        this.startTime = null;
    }

    startMonitoring() {
        this.isMonitoring = true;
        this.startTime = Date.now();
        this.simulateRealTimeData();
    }

    simulateRealTimeData() {
        if (!this.isMonitoring) return;

        // Simulate heart rate changes during exercise
        const baseRate = 70;
        const exerciseIntensity = 30 + Math.random() * 40;
        this.heartRate = Math.round(baseRate + exerciseIntensity + Math.sin(Date.now() * 0.01) * 10);

        // Calculate calories (rough estimate)
        const minutesElapsed = (Date.now() - this.startTime) / 60000;
        this.calories = Math.round(minutesElapsed * 3.5); // Rough calories per minute

        setTimeout(() => this.simulateRealTimeData(), 1000);
    }

    stopMonitoring() {
        this.isMonitoring = false;
        return {
            duration: Math.round((Date.now() - this.startTime) / 1000),
            avgHeartRate: this.heartRate,
            caloriesBurned: this.calories
        };
    }

    getCurrentData() {
        return {
            heartRate: this.heartRate,
            calories: this.calories,
            isActive: this.isMonitoring
        };
    }
}

// AI-powered form analysis
class FormAnalyzer {
    constructor() {
        this.exerciseSpecificAnalysis = {
            'neck': this.analyzeNeckExercise,
            'shoulders': this.analyzeShoulderExercise,
            'back': this.analyzeBackExercise,
            'hips': this.analyzeHipExercise,
            'knees': this.analyzeKneeExercise,
            'ankles': this.analyzeAnkleExercise,
            'wrists': this.analyzeWristExercise,
            'core': this.analyzeCoreExercise
        };
    }

    analyzeForm(bodyPart, exercise, poseData, previousFrames = []) {
        const analyzer = this.exerciseSpecificAnalysis[bodyPart];
        if (!analyzer || !poseData) {
            return this.getDefaultAnalysis();
        }

        return analyzer.call(this, exercise, poseData, previousFrames);
    }

    analyzeNeckExercise(exercise, poseData, previousFrames) {
        const feedback = [];
        let score = 85;

        // Check neck alignment
        const neckAngle = this.calculateAngle(poseData.nose, poseData.leftShoulder, poseData.rightShoulder);
        if (Math.abs(neckAngle - 90) > 15) {
            feedback.push("Keep your head centered between your shoulders");
            score -= 10;
        }

        // Check shoulder level
        const shoulderDiff = Math.abs(poseData.leftShoulder.y - poseData.rightShoulder.y);
        if (shoulderDiff > 20) {
            feedback.push("Keep your shoulders level");
            score -= 5;
        }

        return {
            score: Math.max(0, score + Math.random() * 10 - 5),
            feedback: feedback.length > 0 ? feedback : ["Great neck alignment!"],
            keyPoints: ["Maintain slow, controlled movement", "Keep shoulders relaxed"]
        };
    }

    analyzeShoulderExercise(exercise, poseData, previousFrames) {
        const feedback = [];
        let score = 80;

        // Check arm symmetry
        const leftArmAngle = this.calculateAngle(poseData.leftShoulder, poseData.leftElbow, poseData.leftWrist);
        const rightArmAngle = this.calculateAngle(poseData.rightShoulder, poseData.rightElbow, poseData.rightWrist);
        
        if (Math.abs(leftArmAngle - rightArmAngle) > 20) {
            feedback.push("Keep both arms moving symmetrically");
            score -= 15;
        }

        // Check range of motion
        if (leftArmAngle < 45 || rightArmAngle < 45) {
            feedback.push("Increase your range of motion");
            score -= 10;
        }

        return {
            score: Math.max(0, score + Math.random() * 15 - 7),
            feedback: feedback.length > 0 ? feedback : ["Excellent shoulder mobility!"],
            keyPoints: ["Control the descent", "Feel the stretch at the top"]
        };
    }

    analyzeBackExercise(exercise, poseData, previousFrames) {
        const feedback = [];
        let score = 82;

        // Check spinal alignment
        const spineAlignment = this.calculateSpineAlignment(poseData);
        if (spineAlignment < 0.8) {
            feedback.push("Focus on maintaining neutral spine");
            score -= 12;
        }

        // Check hip level
        const hipLevel = Math.abs(poseData.leftHip.y - poseData.rightHip.y);
        if (hipLevel > 15) {
            feedback.push("Keep your hips level");
            score -= 8;
        }

        return {
            score: Math.max(0, score + Math.random() * 12 - 6),
            feedback: feedback.length > 0 ? feedback : ["Perfect spinal movement!"],
            keyPoints: ["Engage your core", "Move slowly through full range"]
        };
    }

    // Additional exercise-specific analyzers...
    analyzeHipExercise(exercise, poseData, previousFrames) {
        return this.getDefaultAnalysis("Good hip mobility work!");
    }

    analyzeKneeExercise(exercise, poseData, previousFrames) {
        return this.getDefaultAnalysis("Keep those knees tracking well!");
    }

    analyzeAnkleExercise(exercise, poseData, previousFrames) {
        return this.getDefaultAnalysis("Nice ankle range of motion!");
    }

    analyzeWristExercise(exercise, poseData, previousFrames) {
        return this.getDefaultAnalysis("Good wrist flexibility work!");
    }

    analyzeCoreExercise(exercise, poseData, previousFrames) {
        return this.getDefaultAnalysis("Excellent core engagement!");
    }

    getDefaultAnalysis(message = "Good form!") {
        return {
            score: 85 + Math.random() * 10,
            feedback: [message],
            keyPoints: ["Maintain steady breathing", "Focus on quality over quantity"]
        };
    }

    calculateAngle(point1, point2, point3) {
        const angle1 = Math.atan2(point1.y - point2.y, point1.x - point2.x);
        const angle2 = Math.atan2(point3.y - point2.y, point3.x - point2.x);
        return Math.abs(angle1 - angle2) * (180 / Math.PI);
    }

    calculateSpineAlignment(poseData) {
        // Simplified spine alignment calculation
        const shoulderCenter = {
            x: (poseData.leftShoulder.x + poseData.rightShoulder.x) / 2,
            y: (poseData.leftShoulder.y + poseData.rightShoulder.y) / 2
        };
        const hipCenter = {
            x: (poseData.leftHip.x + poseData.rightHip.x) / 2,
            y: (poseData.leftHip.y + poseData.rightHip.y) / 2
        };
        
        const distance = Math.sqrt(
            Math.pow(shoulderCenter.x - hipCenter.x, 2) + 
            Math.pow(shoulderCenter.y - hipCenter.y, 2)
        );
        
        return Math.min(1, 100 / distance);
    }
}

// Export classes for use in main application
window.PhysioVedaAdvanced = {
    ProgressTracker,
    CameraManager,
    VoiceGuide,
    BiometricMonitor,
    FormAnalyzer
}; 