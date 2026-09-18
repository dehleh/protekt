Pod::Spec.new do |s|
  s.name           = 'ShomarDiscovery'
  s.version        = '0.1.0'
  s.summary        = 'Private on-device helpers for SHOMAR Protect'
  s.description    = 'Narrow installed-app discovery on Android and local screenshot text recognition.'
  s.author         = 'SHOMAR Protect'
  s.homepage       = 'https://shomar.io'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { :git => '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
