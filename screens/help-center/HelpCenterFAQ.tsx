import AppSafeAreaView from "@/components/AppSafeAreaView";
import AppText from "@/components/AppText";
import RowSectionHeaderSpacer from "@/components/RowSectionHeaderSpacer";
import Divider from "@/components/Divider";
import { useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import Header from "@/components/Header";
import { ScrollView, StyleSheet, View } from "react-native";

export default function HelpCenterFAQ() {
  const navigation = useNavigation<any>();


  // handlers
  const handleHeaderBackButton = useCallback(() => {
    navigation.goBack();
  }, []);


  return <AppSafeAreaView>
    <Header title={'FAQ'} leftButtonHandler={handleHeaderBackButton} leftButton={'chevron-left'} />
    <RowSectionHeaderSpacer />
    <Divider />

    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View>
        <AppText font={'heavy'}>Question 1</AppText>
        <AppText color={'secondary'} size={'small'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sodales neque sodales ut etiam sit. Euismod lacinia at quis risus sed vulputate odio. Sit amet volutpat consequat mauris nunc congue nisi vitae. Sit amet massa vitae tortor condimentum lacinia quis. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Eu facilisis sed odio morbi quis commodo. Orci sagittis eu volutpat odio facilisis mauris sit. Pretium nibh ipsum consequat nisl. Mauris nunc congue nisi vitae. Non tellus orci ac auctor augue mauris augue neque. Ac ut consequat semper viverra nam libero justo laoreet.

          Mauris sit amet massa vitae. Nulla porttitor massa id neque aliquam. Suspendisse in est ante in nibh mauris cursus. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque. Tristique senectus et netus et malesuada fames ac turpis. Sed augue lacus viverra vitae. Sem fringilla ut morbi tincidunt augue interdum velit euismod in. Ut ornare lectus sit amet. Magnis dis parturient montes nascetur ridiculus mus. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Bibendum neque egestas congue quisque egestas diam in. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque. Eleifend quam adipiscing vitae proin.</AppText>
      </View>

      <View>
        <AppText font={'heavy'}>Question 2</AppText>
        <AppText color={'secondary'} size={'small'}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sodales neque sodales ut etiam sit. Euismod lacinia at quis risus sed vulputate odio. Sit amet volutpat consequat mauris nunc congue nisi vitae. Sit amet massa vitae tortor condimentum lacinia quis. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Eu facilisis sed odio morbi quis commodo. Orci sagittis eu volutpat odio facilisis mauris sit. Pretium nibh ipsum consequat nisl. Mauris nunc congue nisi vitae. Non tellus orci ac auctor augue mauris augue neque. Ac ut consequat semper viverra nam libero justo laoreet.

          Mauris sit amet massa vitae. Nulla porttitor massa id neque aliquam. Suspendisse in est ante in nibh mauris cursus. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque. Tristique senectus et netus et malesuada fames ac turpis. Sed augue lacus viverra vitae. Sem fringilla ut morbi tincidunt augue interdum velit euismod in. Ut ornare lectus sit amet. Magnis dis parturient montes nascetur ridiculus mus. Praesent semper feugiat nibh sed pulvinar proin gravida hendrerit lectus. Bibendum neque egestas congue quisque egestas diam in. Mauris pellentesque pulvinar pellentesque habitant morbi tristique senectus. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque. Eleifend quam adipiscing vitae proin.</AppText>
      </View>
    </ScrollView>
  </AppSafeAreaView>
}


const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
  },
  contentContainer: {
    paddingVertical: 18,
    gap: 30
  }
})