import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { vinylService } from '@/services/vinyl-service';
import { useToast } from '@/hooks';
import { colors, typography, spacing, borderRadius } from '@/theme';

export default function BarcodeScannerScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);
    console.log(`Barcode scanned: ${data} (${type})`);

    try {
      const results = await vinylService.searchByBarcode(data);

      if (results.length === 0) {
        showToast('No vinyl found with this barcode', 'error');
        setTimeout(() => {
          setScanned(false);
        }, 2000);
        return;
      }

      // If found, navigate to add-vinyl flow
      const release = results[0];
      const { artist, album } = vinylService.parseDiscogsTitle(release.title);
      const coverUrl = release.thumb || release.cover_image || '';
      const year = release.year?.toString() || '';
      const label = release.label?.[0] || '';

      router.replace({
        pathname: '/add-vinyl',
        params: {
          releaseId: release.id.toString(),
          coverUrl,
          artist,
          album,
          year,
          label,
        },
      });
    } catch (error: any) {
      console.error('Barcode scan error:', error);

      let errorMessage = 'Failed to search by barcode';
      if (error.message) {
        if (error.message.includes('token not configured')) {
          errorMessage = 'App not configured';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Wait a minute.';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Network error';
        } else {
          errorMessage = error.message;
        }
      }

      showToast(errorMessage, 'error');
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            Vinylia needs camera access to scan vinyl barcodes.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={requestCameraPermission}
          >
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close scanner"
            >
              <X size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTorch(!torch)}
              style={styles.torchButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={torch ? 'Turn off flash' : 'Turn on flash'}
            >
              {torch ? (
                <Zap size={24} color={colors.interactive.primary} fill={colors.interactive.primary} />
              ) : (
                <ZapOff size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.centerContainer}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <Text style={styles.instruction}>
              Point camera at barcode
            </Text>
            <Text style={styles.subInstruction}>
              UPC/EAN usually on back cover
            </Text>
          </View>

          {scanned && (
            <View style={styles.scannedContainer}>
              <Text style={styles.scannedText}>Searching...</Text>
            </View>
          )}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.base,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 280,
    height: 200,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.interactive.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  instruction: {
    color: '#FFFFFF',
    ...typography.h3,
    fontWeight: '600',
    marginTop: spacing.xl,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subInstruction: {
    color: '#FFFFFF',
    ...typography.bodySmall,
    marginTop: spacing.sm,
    textAlign: 'center',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scannedContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scannedText: {
    color: colors.text.inverse,
    ...typography.body,
    fontWeight: '600',
    backgroundColor: colors.interactive.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.sm,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  permissionTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.interactive.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.text.inverse,
    ...typography.body,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: spacing.md,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    ...typography.body,
  },
  message: {
    color: colors.text.primary,
    ...typography.body,
    textAlign: 'center',
  },
});
