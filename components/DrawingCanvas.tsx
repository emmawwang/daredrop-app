import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, Fonts, BorderRadius, Shadows } from "@/constants/theme";
import { captureRef } from "react-native-view-shot";
import ViewShot from "react-native-view-shot";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CANVAS_WIDTH = SCREEN_WIDTH - 40; // Account for padding
const CANVAS_HEIGHT = 400;

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  strokeWidth: number;
}

interface DrawingCanvasProps {
  onDrawingComplete?: (imageUri: string) => void;
  initialDrawing?: string | null; // For loading existing drawings
  onDrawingStart?: () => void; // Callback when drawing starts
  onDrawingEnd?: () => void; // Callback when drawing ends
}

export interface DrawingCanvasRef {
  exportDrawing: () => Promise<string | null>;
  clearDrawing: () => void;
  undoLastPath: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ onDrawingComplete, initialDrawing, onDrawingStart, onDrawingEnd }, ref) => {
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor] = useState(Colors.primary[500]);
  const [strokeWidth] = useState(4);
  const viewShotRef = useRef<ViewShot>(null);
  const currentPathRef = useRef<Point[]>([]);
  const strokeColorRef = useRef(Colors.primary[500]);
  const strokeWidthRef = useRef(4);

  const panResponder = useRef(
    PanResponder.create({
      // Claim responder immediately on touch start
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      // Claim responder on any movement
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      // Prevent other responders from taking over
      onPanResponderTerminationRequest: () => false,
      // Handle touch start
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setIsDrawing(true);
        onDrawingStart?.();
        const newPath = [{ x: locationX, y: locationY }];
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
      },
      // Handle touch move
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = [...currentPathRef.current, { x: locationX, y: locationY }];
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
      },
      // Handle touch end
      onPanResponderRelease: () => {
        const pathToSave = currentPathRef.current;
        // Only save paths with at least 2 points (a valid line)
        if (pathToSave.length >= 2) {
          // Save the current path to the completed paths array
          setPaths((prev) => [
            ...prev,
            {
              id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              points: [...pathToSave],
              color: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
            },
          ]);
        }
        // Clear current path
        currentPathRef.current = [];
        setCurrentPath([]);
        setIsDrawing(false);
        onDrawingEnd?.();
      },
      // Handle if responder is terminated (shouldn't happen with terminationRequest: false)
      onPanResponderTerminate: () => {
        const pathToSave = currentPathRef.current;
        // Only save paths with at least 2 points (a valid line)
        if (pathToSave.length >= 2) {
          setPaths((prev) => [
            ...prev,
            {
              id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              points: [...pathToSave],
              color: strokeColorRef.current,
              strokeWidth: strokeWidthRef.current,
            },
          ]);
        }
        // Clear current path
        currentPathRef.current = [];
        setCurrentPath([]);
        setIsDrawing(false);
        onDrawingEnd?.();
      },
    })
  ).current;

  const clearDrawing = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const undoLastPath = () => {
    setPaths((prev) => prev.slice(0, -1));
  };

  const pathToSvgPath = (points: Point[]): string => {
    if (points.length === 0) return "";
    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y} L ${points[0].x} ${points[0].y}`;
    }

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const exportDrawing = async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current) return null;

      const uri = await captureRef(viewShotRef.current, {
        format: "png",
        quality: 1.0,
      });

      if (onDrawingComplete && uri) {
        onDrawingComplete(uri);
      }

      return uri;
    } catch (error) {
      console.error("Error exporting drawing:", error);
      return null;
    }
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    exportDrawing,
    clearDrawing,
    undoLastPath,
  }));

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolButton, styles.undoButton]}
          onPress={undoLastPath}
          disabled={paths.length === 0}
        >
          <Text style={styles.toolButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, styles.clearButton]}
          onPress={clearDrawing}
          disabled={paths.length === 0 && currentPath.length === 0}
        >
          <Text style={styles.toolButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <ViewShot ref={viewShotRef} style={styles.canvasContainer} options={{ format: "png", quality: 1.0 }}>
        <View
          style={styles.canvas}
          {...panResponder.panHandlers}
          collapsable={false}
        >
          <Svg
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={styles.svg}
          >
            {/* Render all completed paths */}
            {paths.map((path) => (
              <Path
                key={path.id}
                d={pathToSvgPath(path.points)}
                stroke={path.color}
                strokeWidth={path.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
            {/* Render current path being drawn */}
            {currentPath.length > 0 && (
              <Path
                d={pathToSvgPath(currentPath)}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>
        </View>
      </ViewShot>

      {/* Export button - will be handled by parent */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Draw in the box above using your finger
        </Text>
      </View>
    </View>
  );
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  toolbar: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
  },
  toolButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    minWidth: 80,
    alignItems: "center",
  },
  undoButton: {
    backgroundColor: Colors.accent.yellow,
    borderColor: Colors.primary[500],
  },
  clearButton: {
    backgroundColor: "transparent",
    borderColor: Colors.secondary[500],
  },
  toolButtonText: {
    fontSize: 16,
    fontFamily: Fonts.secondary.semiBold,
    color: Colors.primary[500],
  },
  canvasContainer: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary[500],
    overflow: "hidden",
    ...Shadows.medium,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: Colors.white,
  },
  svg: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
  instructions: {
    width: "100%",
    alignItems: "center",
  },
  instructionsText: {
    fontSize: 18,
    fontFamily: Fonts.primary.regular,
    color: Colors.primary[500],
    textAlign: "center",
  },
});

