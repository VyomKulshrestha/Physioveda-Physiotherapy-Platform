// Animation Controller for PhysioVeda Exercises

class ExerciseAnimationController {
    constructor() {
        this.currentAnimation = null;
        this.isPaused = false;
        this.speed = 1;
        this.repCount = 0;
        this.animationInterval = null;
        
        // Exercise animation mappings
        this.exerciseAnimations = {
            // Neck exercises
            'cervical-rotation': 'neck-rotation',
            'upper-trap-stretches': 'neck-stretch',
            'neck-strengthening': 'neck-stretch',
            
            // Shoulder exercises
            'pendulum-swings': 'pendulum-swings',
            'wall-angels': 'arm-raises',
            'rotator-cuff-strengthening': 'shoulder-rolls',
            
            // Back exercises
            'cat-cow-mobilization': 'cat-cow',
            'thoracic-extension': 'back-extension',
            'lower-back-strengthening': 'back-extension',
            
            // Hip exercises
            'hip-flexor-stretches': 'hip-flexor-stretch',
            'clamshells': 'clamshells',
            
            // Knee exercises
            'straight-leg-raises': 'leg-raises',
            'hamstring-curls': 'knee-bends',
            
            // Ankle exercises
            'alphabet-draws': 'ankle-circles',
            'calf-raises-progressive': 'calf-raises',
            
            // Wrist exercises
            'wrist-flexor-stretches': 'wrist-stretch',
            'grip-strengthening': 'grip-strengthening',
            
            // Core exercises
            'dead-bug-exercise': 'dead-bug',
            'bird-dog': 'bird-dog'
        };
    }

    // Create exercise animation component
    createExerciseAnimation(exercise, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const animationKey = this.getAnimationKey(exercise.name);
        if (!animationKey) return null;

        const animationHTML = this.generateAnimationHTML(exercise, animationKey);
        container.innerHTML = animationHTML;
        
        this.setupAnimationControls(container, animationKey);
        this.startRepCounter();
        
        return container;
    }

    // Generate HTML for animation
    generateAnimationHTML(exercise, animationKey) {
        return `
            <div class="exercise-animation-container">
                <div class="exercise-label">${exercise.name}</div>
                
                <div class="exercise-figure ${animationKey} breathing-enhancement">
                    <div class="figure-head"></div>
                    <div class="figure-neck"></div>
                    <div class="figure-body"></div>
                    <div class="figure-arm left">
                        <div class="figure-hand"></div>
                    </div>
                    <div class="figure-arm right">
                        <div class="figure-hand"></div>
                    </div>
                    <div class="figure-leg left">
                        <div class="figure-foot"></div>
                    </div>
                    <div class="figure-leg right">
                        <div class="figure-foot"></div>
                    </div>
                </div>
                
                <div class="breathing-indicator"></div>
                <div class="rep-counter">0</div>
                
                <div class="animation-controls">
                    <button class="animation-btn" data-action="play-pause" title="Play/Pause">
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="animation-btn" data-action="restart" title="Restart">
                        <i class="fas fa-redo"></i>
                    </button>
                    <button class="animation-btn" data-action="speed" title="Speed Control">
                        <i class="fas fa-tachometer-alt"></i>
                        <span class="speed-indicator">1x</span>
                    </button>
                </div>
            </div>
        `;
    }

    // Setup animation controls
    setupAnimationControls(container, animationKey) {
        const playPauseBtn = container.querySelector('[data-action="play-pause"]');
        const restartBtn = container.querySelector('[data-action="restart"]');
        const speedBtn = container.querySelector('[data-action="speed"]');
        const figure = container.querySelector('.exercise-figure');

        // Play/Pause functionality
        playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause(figure, playPauseBtn);
        });

        // Restart functionality
        restartBtn.addEventListener('click', () => {
            this.restartAnimation(figure, playPauseBtn);
        });

        // Speed control functionality
        speedBtn.addEventListener('click', () => {
            this.toggleSpeed(figure, speedBtn);
        });

        this.currentAnimation = { figure, animationKey };
    }

    // Toggle play/pause
    togglePlayPause(figure, button) {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            figure.classList.add('paused');
            button.innerHTML = '<i class="fas fa-play"></i>';
            this.stopRepCounter();
        } else {
            figure.classList.remove('paused');
            button.innerHTML = '<i class="fas fa-pause"></i>';
            this.startRepCounter();
        }
    }

    // Restart animation
    restartAnimation(figure, playPauseBtn) {
        // Remove and re-add the animation class to restart
        const animationClass = Array.from(figure.classList).find(cls => 
            Object.values(this.exerciseAnimations).includes(cls)
        );
        
        if (animationClass) {
            figure.classList.remove(animationClass);
            // Force reflow
            figure.offsetHeight;
            figure.classList.add(animationClass);
        }

        // Reset state
        this.isPaused = false;
        this.repCount = 0;
        figure.classList.remove('paused');
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        this.updateRepCounter();
        this.startRepCounter();
    }

    // Toggle animation speed
    toggleSpeed(figure, button) {
        const speedIndicator = button.querySelector('.speed-indicator');
        const currentSpeed = parseFloat(speedIndicator.textContent);
        
        let newSpeed;
        switch (currentSpeed) {
            case 0.5:
                newSpeed = 1;
                break;
            case 1:
                newSpeed = 2;
                break;
            case 2:
                newSpeed = 0.5;
                break;
            default:
                newSpeed = 1;
        }

        // Update CSS animation duration
        const duration = 3 / newSpeed;
        figure.style.animationDuration = `${duration}s`;
        
        // Update all child elements
        const childElements = figure.querySelectorAll('*');
        childElements.forEach(child => {
            child.style.animationDuration = `${duration}s`;
        });

        speedIndicator.textContent = `${newSpeed}x`;
        this.speed = newSpeed;
    }

    // Start repetition counter
    startRepCounter() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }

        // Calculate interval based on animation duration and speed
        const baseInterval = 3000 / this.speed; // 3 seconds base duration
        
        this.animationInterval = setInterval(() => {
            if (!this.isPaused) {
                this.repCount++;
                this.updateRepCounter();
            }
        }, baseInterval);
    }

    // Stop repetition counter
    stopRepCounter() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    // Update repetition counter display
    updateRepCounter() {
        const repCounter = document.querySelector('.rep-counter');
        if (repCounter) {
            repCounter.textContent = this.repCount;
        }
    }

    // Get animation key for exercise
    getAnimationKey(exerciseName) {
        const normalizedName = exerciseName.toLowerCase().replace(/\s+/g, '-');
        return this.exerciseAnimations[normalizedName] || null;
    }

    // Create preview animation for exercise cards
    createPreviewAnimation(exercise) {
        const animationKey = this.getAnimationKey(exercise.name);
        if (!animationKey) return null;

        return `
            <div class="exercise-preview">
                <div class="exercise-figure ${animationKey}">
                    <div class="figure-head"></div>
                    <div class="figure-neck"></div>
                    <div class="figure-body"></div>
                    <div class="figure-arm left">
                        <div class="figure-hand"></div>
                    </div>
                    <div class="figure-arm right">
                        <div class="figure-hand"></div>
                    </div>
                    <div class="figure-leg left">
                        <div class="figure-foot"></div>
                    </div>
                    <div class="figure-leg right">
                        <div class="figure-foot"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create body part demonstration
    createBodyPartDemo(bodyPartId) {
        const exercises = window.exerciseData?.[bodyPartId] || [];
        if (exercises.length === 0) return null;

        // Use the first exercise as the demo
        const demoExercise = exercises[0];
        const animationKey = this.getAnimationKey(demoExercise.name);
        
        if (!animationKey) return null;

        return `
            <div class="body-part-demo">
                <div class="demo-animation-container">
                    <div class="exercise-figure ${animationKey}">
                        <div class="figure-head"></div>
                        <div class="figure-neck"></div>
                        <div class="figure-body"></div>
                        <div class="figure-arm left">
                            <div class="figure-hand"></div>
                        </div>
                        <div class="figure-arm right">
                            <div class="figure-hand"></div>
                        </div>
                        <div class="figure-leg left">
                            <div class="figure-foot"></div>
                        </div>
                        <div class="figure-leg right">
                            <div class="figure-foot"></div>
                        </div>
                    </div>
                </div>
                <div class="demo-label">
                    <h4>${demoExercise.name}</h4>
                    <p>Preview of available exercises</p>
                </div>
            </div>
        `;
    }

    // Create interactive 3D human model for homepage
    createInteractiveHumanModel(onBodyPartClick) {
        return `
            <div class="interactive-human-section">
                <h2 class="section-title interactive">
                    <i class="fas fa-user-md"></i>
                    Interactive Body Map - Click to Explore
                </h2>
                
                <div class="human-model-container">
                    <div class="human-model-3d">
                        <div class="human-silhouette"></div>
                        <div class="human-figure-3d">
                            <div class="body-part-3d head-neck-region" 
                                 data-body-part="neck-cervical" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Neck and Cervical Region">
                                <div class="body-part-label">Neck & Cervical</div>
                            </div>
                            
                            <div class="body-part-3d shoulders-arms-region" 
                                 data-body-part="shoulders-arms" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Shoulders and Arms Region">
                                <div class="body-part-label">Shoulders & Arms</div>
                            </div>
                            
                            <div class="body-part-3d spine-back-region" 
                                 data-body-part="spine-back" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Spine and Back Region">
                                <div class="body-part-label">Spine & Back</div>
                            </div>
                            
                            <div class="body-part-3d core-abdomen-region" 
                                 data-body-part="core-abdomen" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Core and Abdomen Region">
                                <div class="body-part-label">Core & Abdomen</div>
                            </div>
                            
                            <div class="body-part-3d hips-pelvis-region" 
                                 data-body-part="hips-pelvis" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Hips and Pelvis Region">
                                <div class="body-part-label">Hips & Pelvis</div>
                            </div>
                            
                            <div class="body-part-3d knees-legs-region" 
                                 data-body-part="knees-legs" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Knees and Legs Region">
                                <div class="body-part-label">Knees & Legs</div>
                            </div>
                            
                            <div class="body-part-3d ankles-feet-region" 
                                 data-body-part="ankles-feet" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Ankles and Feet Region">
                                <div class="body-part-label">Ankles & Feet</div>
                            </div>
                            
                            <div class="body-part-3d wrists-hands-left" 
                                 data-body-part="wrists-hands" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Left Wrist and Hand">
                                <div class="body-part-label">Wrists & Hands</div>
                            </div>
                            
                            <div class="body-part-3d wrists-hands-right" 
                                 data-body-part="wrists-hands" 
                                 role="button" 
                                 tabindex="0"
                                 aria-label="Right Wrist and Hand">
                                <div class="body-part-label">Wrists & Hands</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="human-model-guide">
                        <h3 class="guide-title">How to Navigate</h3>
                        <p class="guide-description">
                            Explore different areas of your body by clicking on the interactive regions. 
                            Each area contains specialized physiotherapy exercises designed for optimal recovery.
                        </p>
                        <ul class="guide-instructions">
                            <li>Click any body region to explore</li>
                            <li>View targeted exercise programs</li>
                            <li>Follow animated demonstrations</li>
                            <li>Track your progress and improvements</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup interactive human model event handlers
    setupInteractiveHumanModel(container, onBodyPartClick) {
        const bodyParts = container.querySelectorAll('.body-part-3d');
        
        // Mapping from interactive model IDs to actual body part IDs
        const bodyPartMapping = {
            'neck-cervical': 'neck',
            'shoulders-arms': 'shoulders',
            'spine-back': 'back',
            'core-abdomen': 'core',
            'hips-pelvis': 'hips',
            'knees-legs': 'knees',
            'ankles-feet': 'ankles',
            'wrists-hands': 'wrists'
        };
        
        bodyParts.forEach(bodyPart => {
            const bodyPartId = bodyPart.dataset.bodyPart;
            const mappedBodyPartId = bodyPartMapping[bodyPartId] || bodyPartId;
            
            // Click handler
            bodyPart.addEventListener('click', (e) => {
                this.createRippleEffect(e, bodyPart);
                if (onBodyPartClick) {
                    onBodyPartClick(mappedBodyPartId);
                }
            });
            
            // Keyboard handler
            bodyPart.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.createRippleEffect(e, bodyPart);
                    if (onBodyPartClick) {
                        onBodyPartClick(mappedBodyPartId);
                    }
                }
            });
            
            // Hover effects
            bodyPart.addEventListener('mouseenter', () => {
                bodyPart.classList.add('active');
            });
            
            bodyPart.addEventListener('mouseleave', () => {
                bodyPart.classList.remove('active');
            });
        });
    }

    // Create ripple effect on interaction
    createRippleEffect(event, element) {
        const ripple = document.createElement('div');
        ripple.className = 'interaction-ripple';
        
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    // Cleanup animations
    cleanup() {
        this.stopRepCounter();
        this.currentAnimation = null;
        this.isPaused = false;
        this.speed = 1;
        this.repCount = 0;
    }

    // Voice integration for animations
    announceExercisePhase(phase) {
        if (window.PhysioVedaAdvanced?.VoiceGuide) {
            const voiceGuide = new window.PhysioVedaAdvanced.VoiceGuide();
            
            const messages = {
                start: "Animation demonstration starting. Follow the movement pattern.",
                pause: "Animation paused. Take a moment to review the form.",
                resume: "Continuing animation. Match your movements to the demonstration.",
                complete: "Animation complete. Great job following along!"
            };

            if (messages[phase]) {
                voiceGuide.speak(messages[phase]);
            }
        }
    }

    // Advanced features
    createSlowMotionDemo(exercise) {
        const animationKey = this.getAnimationKey(exercise.name);
        if (!animationKey) return null;

        return `
            <div class="slow-motion-demo">
                <h4>Slow Motion Breakdown</h4>
                <div class="exercise-animation-container">
                    <div class="exercise-figure ${animationKey} speed-half">
                        <div class="figure-head"></div>
                        <div class="figure-neck"></div>
                        <div class="figure-body"></div>
                        <div class="figure-arm left">
                            <div class="figure-hand"></div>
                        </div>
                        <div class="figure-arm right">
                            <div class="figure-hand"></div>
                        </div>
                        <div class="figure-leg left">
                            <div class="figure-foot"></div>
                        </div>
                        <div class="figure-leg right">
                            <div class="figure-foot"></div>
                        </div>
                    </div>
                    <div class="phase-indicators">
                        <div class="phase-dot active"></div>
                        <div class="phase-dot"></div>
                        <div class="phase-dot"></div>
                        <div class="phase-dot"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create exercise comparison
    createExerciseComparison(correctExercise, commonMistake) {
        return `
            <div class="exercise-comparison">
                <div class="comparison-side correct">
                    <h5>✓ Correct Form</h5>
                    ${this.createPreviewAnimation(correctExercise)}
                </div>
                <div class="comparison-side incorrect">
                    <h5>✗ Common Mistake</h5>
                    ${this.createPreviewAnimation(commonMistake)}
                </div>
            </div>
        `;
    }
}

// Exercise Animation React Component
function ExerciseAnimationComponent({ exercise, showControls = true, autoPlay = true }) {
    const animationRef = React.useRef(null);
    const controllerRef = React.useRef(new ExerciseAnimationController());

    React.useEffect(() => {
        if (exercise && animationRef.current) {
            const containerId = `animation-${exercise.id}`;
            animationRef.current.id = containerId;
            
            controllerRef.current.createExerciseAnimation(exercise, containerId);
        }

        return () => {
            controllerRef.current.cleanup();
        };
    }, [exercise]);

    if (!exercise) return null;

    return React.createElement('div', {
        ref: animationRef,
        className: 'animation-component',
        style: { width: '100%', height: 'auto' }
    });
}

// Exercise Preview Component for cards
function ExercisePreviewComponent({ exercise }) {
    const controller = React.useMemo(() => new ExerciseAnimationController(), []);
    
    const previewHTML = controller.createPreviewAnimation(exercise);
    
    if (!previewHTML) {
        return React.createElement('div', {
            className: 'exercise-preview-fallback',
            style: {
                height: '150px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem'
            }
        }, React.createElement('i', { className: 'fas fa-dumbbell' }));
    }

    return React.createElement('div', {
        dangerouslySetInnerHTML: { __html: previewHTML }
    });
}

// Export for global use
window.ExerciseAnimationController = ExerciseAnimationController;
window.ExerciseAnimationComponent = ExerciseAnimationComponent;
window.ExercisePreviewComponent = ExercisePreviewComponent; 