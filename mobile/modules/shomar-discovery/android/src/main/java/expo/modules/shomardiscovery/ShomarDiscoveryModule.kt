package expo.modules.shomardiscovery

import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class ShomarDiscoveryModule : Module() {
  private fun openImageStream(context: android.content.Context, uri: Uri, raw: String) =
    if (uri.scheme == "content") context.contentResolver.openInputStream(uri)
    else java.io.FileInputStream(uri.path ?: raw)

  override fun definition() = ModuleDefinition {
    Name("ShomarDiscovery")

    // Called only after the user accepts the on-device discovery explanation.
    // Returns supported catalog IDs, never a complete app inventory or account data.
    AsyncFunction("findInstalledApps") {
      val context = appContext.reactContext ?: throw IllegalStateException("App context unavailable")
      val json = context.assets.open("shomar-supported-apps.json").bufferedReader().use { it.readText() }
      val supported = JSONObject(json)
      val found = mutableListOf<String>()
      val keys = supported.keys()
      while (keys.hasNext()) {
        val id = keys.next()
        val packages = supported.getJSONArray(id)
        for (index in 0 until packages.length()) {
          try {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(packages.getString(index), 0)
            found.add(id)
            break
          } catch (_: PackageManager.NameNotFoundException) {
            // Not visible or not installed in this Android profile.
          }
        }
      }
      found
    }

    AsyncFunction("recognizeText") { uri: String, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("E_CONTEXT", "App context unavailable", null)
        return@AsyncFunction
      }
      try {
        val parsed = Uri.parse(uri)
        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        openImageStream(context, parsed, uri).use { BitmapFactory.decodeStream(it, null, bounds) }
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
          promise.reject("E_IMAGE", "The selected image could not be decoded.", null)
          return@AsyncFunction
        }
        var sampleSize = 1
        while (bounds.outWidth / sampleSize > 4096 || bounds.outHeight / sampleSize > 4096 ||
          (bounds.outWidth.toLong() / sampleSize) * (bounds.outHeight.toLong() / sampleSize) > 16_000_000L) {
          sampleSize *= 2
        }
        val options = BitmapFactory.Options().apply { inSampleSize = sampleSize }
        val bitmap = openImageStream(context, parsed, uri).use { BitmapFactory.decodeStream(it, null, options) }
        if (bitmap == null) {
          promise.reject("E_IMAGE", "The selected image could not be decoded.", null)
          return@AsyncFunction
        }
        val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
        recognizer.process(InputImage.fromBitmap(bitmap, 0))
          .addOnSuccessListener { result -> recognizer.close(); promise.resolve(result.text) }
          .addOnFailureListener { error -> recognizer.close(); promise.reject("E_OCR", "Text could not be read from this image.", error) }
      } catch (error: Exception) {
        promise.reject("E_IMAGE", "The selected image could not be opened.", error)
      }
    }
  }
}
