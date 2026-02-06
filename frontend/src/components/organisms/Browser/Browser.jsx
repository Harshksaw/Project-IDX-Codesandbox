import { useRef } from "react";
import { Input, Row } from "antd";
import { ReloadOutlined } from "@ant-design/icons";

export const Browser = ({ projectId }) => {

    const browserRef = useRef(null);

    // Use the preview proxy URL instead of direct localhost port
    const previewUrl = `/preview/${projectId}/`;

    function handleRefresh() {
        if(browserRef.current) {
            browserRef.current.src = previewUrl;
        }
    }

    return (
        <Row
            style={{
                backgroundColor: "#22212b"
            }}
        >
            <Input
                style={{
                    width: "100%",
                    height: "30px",
                    color: "white",
                    fontFamily: "Fira Code",
                    backgroundColor: "#282a35",
                }}
                prefix={<ReloadOutlined onClick={handleRefresh} />}
                value={previewUrl}
                readOnly
            />

            <iframe
                ref={browserRef}
                src={previewUrl}
                style={{
                    width: "100%",
                    height: "95vh",
                    border: "none"
                }}
            />

        </Row>
    )

}