#version 150

#define PI 3.1415926538

out vec4 fragColor;

in vec2 v_texcoord;
in vec3 v_viewSpaceNormal;
in vec3 v_viewSpacePos;
in float v_terrainHeight;

uniform vec4 lightPosition;
uniform vec4 lightColor;
uniform vec4 terrainAmbient;
uniform vec4 terrainDiffuse;
uniform vec4 terrainSpecular;
uniform float terrainShininess;
uniform vec4 waterAmbient;
uniform vec4 waterDiffuse;
uniform vec4 waterSpecular;
uniform float waterShininess;
uniform float waterLevel;

// These are passed in from OF programmable renderer
uniform mat4 modelViewMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 textureMatrix;
uniform mat4 modelViewProjectionMatrix;

void pointLight(in vec3 normal, in vec3 surfacePosition, inout vec3 diffuse, inout vec3 specular, float shininess){
    float nDotVP;       // normal . light direction
    float nDotHV;       // normal . light half vector
    vec3  halfVector;   // direction of maximum highlights

	// Compute direction from surface point to the eye
	// Note: eye is at (0,0,0) in view space
    vec3 eyeDir = normalize(-surfacePosition);

    // Compute direction from surface to light position
	vec4 viewSpaceLightPos = viewMatrix * lightPosition;
    vec3 lightDir = normalize(viewSpaceLightPos.xyz - surfacePosition);

    // Compute the half vector between lightDir and eyeDir
    halfVector = normalize(lightDir + eyeDir);

	// Compute dot products for use in calculations
    nDotHV = max(0.0, dot(normal, halfVector));
    nDotVP = max(0.0, dot(normal, lightDir));

	// Calculate diffuse contribution of light to the surface
    diffuse += lightColor.rgb * nDotVP;

	// Calculate specular contribution of light to the surface
    vec3 specularReflection = vec3(lightColor.rgb) * pow(nDotHV, shininess);
    specular += mix(vec3(0.0), specularReflection, step(0.0000001, nDotVP));
}

void main (void) {
    vec3 ambient = vec3(0,0,0);
    vec3 diffuse = vec3(0,0,0);
    vec3 specular = vec3(0,0,0);

	// Re-normalize v_viewSpaceNormal to avoid interpollation artefacts
	vec3 normal = normalize(v_viewSpaceNormal);

	vec4 matDiffuse;
	vec4 matSpecular;
	float matShininess;
	vec4 matAmbient;

	if (v_terrainHeight > waterLevel + 0.001) {
		matDiffuse = terrainDiffuse;
		matSpecular = terrainSpecular;
		matShininess = terrainShininess;
		matAmbient = terrainAmbient;
	}
	else {
		matDiffuse = waterDiffuse;
		matSpecular = waterSpecular;
		matShininess = waterShininess;
		matAmbient = waterAmbient;
	}

	// Get the contribution of the light to the diffuse and specular light on the surface
    pointLight(normal, v_viewSpacePos, diffuse, specular, matShininess);

	// Combine the lighting contributions to calculate the fragment color
    fragColor = matAmbient + vec4(diffuse,1.0) * matDiffuse + vec4(specular,1.0) * matSpecular;

	//fragColor = vec4(v_viewSpaceNormal, 1.0);
}
