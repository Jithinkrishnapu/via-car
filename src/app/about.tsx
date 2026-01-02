import AboutModal from "@/components/modals/AboutModal"
import { SafeAreaView } from "react-native"

const About =()=>{
    return <SafeAreaView className="flex-1 py-10 bg-white" >
        <AboutModal isClose={false} />
    </SafeAreaView>
}


export default About