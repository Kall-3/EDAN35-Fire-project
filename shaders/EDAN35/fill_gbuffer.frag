#version 410

uniform bool has_diffuse_texture;
uniform bool has_specular_texture;
uniform bool has_normals_texture;
uniform bool has_opacity_texture;
uniform sampler2D diffuse_texture;
uniform sampler2D specular_texture;
uniform sampler2D normals_texture;
uniform sampler2D opacity_texture;
uniform mat4 normal_model_to_world;

in VS_OUT {
	vec3 normal;
	vec2 texcoord;
	vec3 tangent;
	vec3 binormal;
} fs_in;

layout (location = 0) out vec4 geometry_diffuse;
layout (location = 1) out vec4 geometry_specular;
layout (location = 2) out vec4 geometry_normal;
layout (location = 3) out vec4 geometry_opacity;


void main()
{
	geometry_opacity = vec4(0.0);
	// Fire color and alpha/noice
	if (has_opacity_texture)
		geometry_opacity = texture(opacity_texture, fs_in.texcoord);

	// Diffuse color
	geometry_diffuse = vec4(0.0);
	if (has_diffuse_texture)
		geometry_diffuse = texture(diffuse_texture, fs_in.texcoord);

	// Specular color
	geometry_specular = vec4(0.0);
	if (has_specular_texture)
		geometry_specular = texture(specular_texture, fs_in.texcoord);

	// Worldspace normal
	if(has_normals_texture){
		vec3 b = normalize(fs_in.binormal);
		vec3 n = normalize(fs_in.normal);
		vec3 t = normalize(fs_in.tangent);
		mat3x3 tbn = mat3(t,b,n);
		n = tbn * (2.0 * texture(normals_texture, fs_in.texcoord) - 1.0).xyz;
		geometry_normal.xyz = normalize(n) + 1.0 / 2.0;
	} else {
		geometry_normal.xyz = fs_in.normal + 1.0 / 2.0;
	}
}
