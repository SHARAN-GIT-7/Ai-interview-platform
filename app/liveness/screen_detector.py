import cv2
import numpy as np


def detect_screen(frame, aggressive=False):
    """
    Detect if the image is from a phone/monitor screen using multiple techniques
    
    Args:
        frame: Input image (BGR format)
        aggressive: If True, uses stricter thresholds
    
    Returns:
        True if screen detected, False otherwise
    """
    
    if frame is None or frame.size == 0:
        return False
    
    # Combine multiple detection methods for robustness
    screen_indicators = 0
    total_checks = 0
    
    # ========================================
    # 1. Laplacian Variance (Sharpness)
    # ========================================
    # Phone screens typically have lower sharpness
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    threshold = 60 if aggressive else 80
    if lap_var < threshold:
        screen_indicators += 1
    total_checks += 1
    
    # ========================================
    # 2. Moiré Pattern Detection
    # ========================================
    # Screens often show moiré patterns when photographed
    # Use FFT to detect periodic patterns
    try:
        dft = cv2.dft(np.float32(gray), flags=cv2.DFT_COMPLEX_OUTPUT)
        dft_shift = np.fft.fftshift(dft)
        magnitude = cv2.magnitude(dft_shift[:,:,0], dft_shift[:,:,1])
        
        # High frequency energy indicates moiré
        h, w = magnitude.shape
        center_h, center_w = h//2, w//2
        
        # Exclude center (DC component)
        mask = np.ones((h, w), dtype=np.uint8)
        cv2.circle(mask, (center_w, center_h), 30, 0, -1)
        
        high_freq_energy = np.mean(magnitude[mask == 1])
        low_freq_energy = np.mean(magnitude[mask == 0])
        
        ratio = high_freq_energy / (low_freq_energy + 1e-6)
        
        # Screens often have higher high-frequency content
        if ratio > 0.15:
            screen_indicators += 1
        total_checks += 1
    except:
        # FFT failed, skip this check
        pass
    
    # ========================================
    # 3. Color Histogram Analysis
    # ========================================
    # Screens often have limited color range or color casts
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    
    # Check saturation distribution
    saturation = hsv[:,:,1]
    sat_mean = np.mean(saturation)
    sat_std = np.std(saturation)
    
    # Screens often have lower saturation variance
    if sat_std < 35:
        screen_indicators += 1
    total_checks += 1
    
    # ========================================
    # 4. Edge Density
    # ========================================
    # Screens may have unusual edge characteristics
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Very low or very high edge density can indicate screen
    if edge_density < 0.03 or edge_density > 0.25:
        screen_indicators += 1
    total_checks += 1
    
    # ========================================
    # 5. Pixel Regularity
    # ========================================
    # Screens have regular pixel patterns
    # Check for regular grid-like structures
    sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
    sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
    
    # Standard deviation of gradients
    grad_x_std = np.std(sobel_x)
    grad_y_std = np.std(sobel_y)
    
    # Regular patterns have low gradient variance
    if grad_x_std < 20 or grad_y_std < 20:
        screen_indicators += 1
    total_checks += 1
    
    # ========================================
    # Final Decision
    # ========================================
    # If aggressive mode, require fewer indicators
    required_indicators = 2 if aggressive else 3
    
    return screen_indicators >= required_indicators


def detect_screen_with_confidence(frame):
    """
    Detect screen with confidence score
    
    Returns:
        Tuple of (is_screen, confidence)
        is_screen: Boolean
        confidence: 0.0 to 1.0
    """
    
    if frame is None or frame.size == 0:
        return False, 0.0
    
    indicators = []
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # 1. Laplacian variance
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    lap_score = max(0, (100 - lap_var) / 100)  # Normalize
    indicators.append(lap_score)
    
    # 2. Saturation variance
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    sat_std = np.std(hsv[:,:,1])
    sat_score = max(0, (50 - sat_std) / 50)
    indicators.append(sat_score)
    
    # 3. Edge density
    edges = cv2.Canny(gray, 50, 150)
    edge_density = np.sum(edges > 0) / edges.size
    
    # Anomalous edge density
    if edge_density < 0.05:
        edge_score = 0.8
    elif edge_density > 0.2:
        edge_score = 0.6
    else:
        edge_score = 0.0
    indicators.append(edge_score)
    
    # Average confidence
    confidence = np.mean(indicators)
    
    # Decision threshold
    is_screen = confidence > 0.5
    
    return is_screen, confidence


def detect_reflection(frame):
    """
    Detect specular reflections common in photos of screens
    
    Returns:
        True if strong reflections detected
    """
    
    if frame is None or frame.size == 0:
        return False
    
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Threshold for very bright pixels (potential reflections)
    bright_pixels = np.sum(gray > 240)
    total_pixels = gray.size
    
    bright_ratio = bright_pixels / total_pixels
    
    # More than 5% very bright pixels suggests reflections
    return bright_ratio > 0.05