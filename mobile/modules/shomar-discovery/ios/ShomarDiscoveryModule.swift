import ExpoModulesCore
import ImageIO
import UIKit
import Vision

public class ShomarDiscoveryModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ShomarDiscovery")

    AsyncFunction("recognizeText") { (uri: String, promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        guard let url = URL(string: uri),
              let source = CGImageSourceCreateWithURL(url as CFURL, [kCGImageSourceShouldCache: false] as CFDictionary),
              let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, [
                kCGImageSourceCreateThumbnailFromImageAlways: true,
                kCGImageSourceCreateThumbnailWithTransform: true,
                kCGImageSourceThumbnailMaxPixelSize: 4096,
                kCGImageSourceShouldCacheImmediately: true
              ] as CFDictionary) else {
          promise.reject("E_IMAGE", "The selected image could not be opened.")
          return
        }
        let request = VNRecognizeTextRequest { request, error in
          if let error {
            promise.reject("E_OCR", "Text could not be read from this image.", error)
            return
          }
          let text = (request.results as? [VNRecognizedTextObservation])?
            .compactMap { $0.topCandidates(1).first?.string }
            .joined(separator: "\n") ?? ""
          promise.resolve(text)
        }
        request.recognitionLevel = .accurate
        request.recognitionLanguages = ["en-US"]
        request.usesLanguageCorrection = true
        do { try VNImageRequestHandler(cgImage: cgImage).perform([request]) }
        catch { promise.reject("E_OCR", "Text could not be read from this image.", error) }
      }
    }
  }
}
