#!/bin/bash

# Set your working directory (this script assumes it's in the project root)
WORKDIR=$(pwd)

# Set paths
IOS_DIR="$WORKDIR/ios"
ARCHIVE_PATH="$IOS_DIR/build/MyApp.xcarchive"
EXPORT_PATH="$WORKDIR/build"

# Clean the build directory
echo "Cleaning Xcode build..."
cd "$IOS_DIR"
xcodebuild clean

# Install dependencies
echo "Installing CocoaPods..."
pod install

# Build the project
echo "Building the project..."
xcodebuild -workspace YourApp.xcworkspace -scheme YourApp -configuration Release archive -archivePath "$ARCHIVE_PATH"

# Export the .ipa file
echo "Exporting .ipa..."
fastlane gym --scheme "YourApp" --export_method "ad-hoc" --output_directory "$EXPORT_PATH" --archive_path "$ARCHIVE_PATH"

# Done!
echo "iOS build completed and saved to $EXPORT_PATH"
